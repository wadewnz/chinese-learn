import type { DirectiveBinding, ObjectDirective } from 'vue'

interface ExtendedDirective<T = any, V = any> extends ObjectDirective<T, V> {
  pointerdownEvent: V
  pointerupEvent: V
}

type CallbackType = () => void

interface ExtendedHTMLElement extends HTMLElement {
  additionalData: {
    timeout: ReturnType<typeof setTimeout> | null,
    pressed: boolean    
  };
}
const pointerdownEvent = (el: ExtendedHTMLElement, binding: DirectiveBinding) => {
  const delay = binding.arg ? parseInt(binding.arg) : 1000
  if (binding.arg === 'start') {
    if (!el.additionalData.pressed) {
        binding.value()
    }
    el.additionalData.pressed = true
    return
  }
  if (el.additionalData.timeout !== null) {
    return
  }

  el.additionalData.timeout = setTimeout(binding.value, delay)
//     el.additionalData.timeout = setTimeout(() => {
//     // console.log('setTimeout', binding?.instance)
//     // binding?.instance?.$emit('longPress')
//     // binding.instance.
//     console.log(vnode)
//     console.log(binding.instance.children)
//     // binding.instance.$emit('longPress')
//     if (vnode) {
//         console.log("Got here")
//         //vnode.children[1].children[0].component.emit('longPress')
//         // vnode?.componentInstance.$emit('long-press-start')
//         //vnode?.children[0].$emit('longPress')
//         // vnode.component?.emit('longPress')
//         // vnode.el.dispatchEvent(new CustomEvent('longPress'))
//     }
//     else {
//         el.dispatchEvent(new CustomEvent('longPress'))
//     }
//   }, delay)
}

const pointerupEvent = (el: ExtendedHTMLElement) => {   
  el.additionalData.pressed = false
  if (el.additionalData.timeout !== null) {
    el.additionalData.pressed = false
    clearTimeout(el.additionalData.timeout)
    el.additionalData.timeout = null
  }
}

export const vLongPress: ExtendedDirective<ExtendedHTMLElement, CallbackType> = {
  pointerdownEvent: () => ({}),
  pointerupEvent: () => ({}),
  mounted(el, binding) {
    el.additionalData = {
      timeout: null,
      pressed: false
    }    
    const dir = binding.dir as ExtendedDirective<ExtendedHTMLElement, CallbackType>
    dir.pointerdownEvent = () => pointerdownEvent(el, binding)
    dir.pointerupEvent = () => pointerupEvent(el)
    el.addEventListener('pointerdown', dir.pointerdownEvent)
    el.addEventListener('pointerup', dir.pointerupEvent)
    el.addEventListener('pointerout', dir.pointerupEvent)
    el.addEventListener('pointercancel', dir.pointerupEvent)
    el.addEventListener('pointermove', dir.pointerupEvent)
  },
  beforeUnmount(el, binding) {
    const dir = binding.dir as ExtendedDirective<ExtendedHTMLElement, CallbackType>
    el.removeEventListener('pointerdown', dir.pointerdownEvent)
    el.removeEventListener('pointerup', dir.pointerupEvent)
    el.removeEventListener('pointerout', dir.pointerupEvent)
    el.removeEventListener('pointercancel', dir.pointerupEvent)
    el.removeEventListener('pointermove', dir.pointerupEvent)
  },
}