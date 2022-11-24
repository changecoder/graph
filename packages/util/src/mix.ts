function _mix(dist: object, obj: object): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && key !== 'constructor' && (<any>obj)[key] !== undefined) {
      (<any>dist)[key] = (<any>obj)[key]
    }
  }
}

export default function mix(dist: object, src1?: object, src2?: object, src3?: object): object {
  if (src1) {
    _mix(dist, src1)
  }
  if (src2) {
    _mix(dist, src2)
  }
  if (src3) {
    _mix(dist, src3)
  }
  return dist
}