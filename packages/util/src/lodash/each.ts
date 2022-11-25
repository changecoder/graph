import isArray from './is-array'
import isObject from './is-object'

export default function each(elements: any[] | object, func: (v: any, k: any) => any): void {
  if (!elements) {
    return
  }
  let rst
  if (isArray(elements)) {
    for (let i = 0, len = elements.length; i < len; i++) {
      rst = func(elements[i], i)
      if (rst === false) {
        break
      }
    }
  } else if (isObject(elements)) {
    for (const k in elements) {
      if (Object.prototype.hasOwnProperty.call(elements, k)) {
        rst = func((<any>elements)[k], k)
        if (rst === false) {
          break
        }
      }
    }
  }
}