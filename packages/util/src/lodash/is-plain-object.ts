import isObjectLike from './is-object-like'
import isType from './is-type'

const isPlainObject = function (value: any): value is object {
  if (!isObjectLike(value) || !isType(value, 'Object')) {
    return false
  }
  if (Object.getPrototypeOf(value) === null) {
    return true
  }
  let proto = value
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }
  return Object.getPrototypeOf(value) === proto
}

export default isPlainObject