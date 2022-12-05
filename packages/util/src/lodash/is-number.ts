import isType from './is-type'

const isNumber = function (value: any): value is number {
  return isType(value, 'Number')
}
export default isNumber