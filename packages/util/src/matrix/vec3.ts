// Transforms the vec3 with a mat3.
export const transformMat3 = (out: Array<number>, a: Array<number>, m: Array<number>)  => {
  const x = a[0]
  const y = a[1]
  const z = a[2]
  out[0] = x * m[0] + y * m[3] + z * m[6]
  out[1] = x * m[1] + y * m[4] + z * m[7]
  out[2] = x * m[2] + y * m[5] + z * m[8]
  return out
}