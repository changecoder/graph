export interface OptionsType {
  leading?: boolean;
  trailing?: boolean;
}

export default (func: Function, wait: number, options: OptionsType): Function => {
  let timeout: number | undefined
  let context: any
  let args: any
  let result: any
  let previous = 0
  if (!options) options = {}

  const later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = undefined
    result = func.apply(context, args)
    if (!timeout) {
      context = args = null
    }
  }

  const throttled = function (this: any) {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    const remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = window.setTimeout(later, remaining)
    }
    return result
  }

  throttled.cancel = function () {
    window.clearTimeout(timeout)
    previous = 0
    timeout = context = args = undefined
  }

  return throttled
}