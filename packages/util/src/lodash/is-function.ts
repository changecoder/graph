export default (value: any): value is Function => {
  return typeof value === 'function'
}