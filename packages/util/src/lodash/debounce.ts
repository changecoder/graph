export default function debounce(func: Function, wait?: number, immediate?: boolean) {
  let timeout: number | undefined
  return function(this: any, ...args: any) {
    const context = this
    const later = function() {
      timeout = undefined
      if (!immediate) {
        func.apply(context, args)
      }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}