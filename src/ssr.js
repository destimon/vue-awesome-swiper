
/*
* VueAwesomeSwiper ssr.js
* Author: surmon@foxmail.com
* Github: https://github.com/surmon-china/vue-awesome-swiper
*/

// Require sources
import objectAssign from 'object-assign'

let Swiper = window.Swiper;

// as of swiper 4.0.7
// http://idangero.us/swiper/api/#events
const DEFAULT_EVENTS = [
  'beforeDestroy',
  'slideChange',
  'slideChangeTransitionStart',
  'slideChangeTransitionEnd',
  'slideNextTransitionStart',
  'slideNextTransitionEnd',
  'slidePrevTransitionStart',
  'slidePrevTransitionEnd',
  'transitionStart',
  'transitionEnd',
  'touchStart',
  'touchMove',
  'touchMoveOpposite',
  'sliderMove',
  'touchEnd',
  'click',
  'tap',
  'doubleTap',
  'imagesReady',
  'progress',
  'reachBeginning',
  'reachEnd',
  'fromEdge',
  'setTranslate',
  'setTransition',
  'resize'
]

// swiperDirective
const swiperDirective = (globalOptions, mySwiper) => {

  Swiper = mySwiper || window.Swiper;
  // Get swiper instace name in directive
  const getInstanceName = (el, binding, vnode) => {
    let instanceName = null
    if (binding.arg) {
      instanceName = binding.arg
    } else if (vnode.data.attrs && (vnode.data.attrs.instanceName || vnode.data.attrs['instance-name'])) {
      instanceName = (vnode.data.attrs.instanceName || vnode.data.attrs['instance-name'])
    } else if (el.id) {
      instanceName = el.id
    }
    return instanceName || 'swiper'
  }

  return {

    // Init
    bind(el, binding, vnode) {
      const self = vnode.context
      if (el.className.indexOf('swiper-container') === -1) {
        el.className += ((el.className ? ' ' : '') + 'swiper-container')
      }
    },

    // DOM inserted
    inserted(el, binding, vnode) {
      const self = vnode.context
      const options = binding.value
      const instanceName = getInstanceName(el, binding, vnode)
      let swiper = self[instanceName]

      // Emit event in Vue directive
      const eventEmit = (vnode, name, data) => {
        const handlers = (vnode.data && vnode.data.on) || 
                         (vnode.componentOptions && vnode.componentOptions.listeners)
        if (handlers && handlers[name]) handlers[name].fns(data)
      }

      if (typeof Swiper.then === 'function') { // if promise
        Swiper.then(ready);
      }
      else {
        ready(Swiper);
      }

      function ready(_Swiper) {
        if (self._isDestroyed) { // vue component already destroyed
          return;
        }
        if (!swiper) {
          const swiperOptions = objectAssign({}, globalOptions, options)
          swiper = self[instanceName] = new _Swiper(el, swiperOptions)
          DEFAULT_EVENTS.forEach(eventName => {
            swiper.on(eventName, function() {
              eventEmit(vnode, eventName, ...arguments)
              eventEmit(vnode, eventName.replace(/([A-Z])/g, '-$1'), ...arguments)
            })
          })
        }
  
        eventEmit(vnode, 'ready', swiper)
      }
    },

    // Parse options change
    componentUpdated(el, binding, vnode) {
      const instanceName = getInstanceName(el, binding, vnode)
      const swiper = vnode.context[instanceName]
      if (swiper) {
        swiper.update && swiper.update()
        swiper.navigation && swiper.navigation.update()
        swiper.pagination && swiper.pagination.render()
        swiper.pagination && swiper.pagination.update()
      }
    },

    // Destroy this directive
    unbind(el, binding, vnode) {
      const instanceName = getInstanceName(el, binding, vnode)
      const swiper = vnode.context[instanceName]
      if (swiper) {
        swiper.destroy && swiper.destroy()
        delete vnode.context[instanceName]
      }
    }
  }
}

// swiperDirective
const swiper = swiperDirective({})

// Global swiper default options
const install = function (Vue, globalOptions = {}, mySwiper) {

  // Mount swiper directive for Vue global
  Vue.directive('swiper', swiperDirective(globalOptions, mySwiper))
}

const VueAwesomeSwiper = { Swiper, swiper, install }

export { Swiper, swiper, install }
export default VueAwesomeSwiper
