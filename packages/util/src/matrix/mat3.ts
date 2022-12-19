export const fromTranslation = (out: Array<number>, v: Array<number>) => {
  out[0] = 1
  out[1] = 0
  out[2] = 0
  out[3] = 1
  out[4] = v[0]
  out[5] = v[1]
  return out
}

export const fromRotation = (out: Array<number>, rad: number) => {
  const  s = Math.sin(rad)
  const c = Math.cos(rad)
  out[0] = c
  out[1] = s
  out[2] = -s
  out[3] = c
  out[4] = 0
  out[5] = 0
  return out
}

export const fromScaling = (out: Array<number>, v: Array<number>) => {
  out[0] = v[0]
  out[1] = 0
  out[2] = 0
  out[3] = v[1]
  out[4] = 0
  out[5] = 0
  return out
}

export const multiply = (out: Array<number>, a: Array<number>, b: Array<number>) => {
  const a0 = a[0]
  const a1 = a[1]
  const a2 = a[2]
  const a3 = a[3]
  const a4 = a[4]
  const a5 = a[5]
  const b0 = b[0]
  const b1 = b[1]
  const b2 = b[2]
  const b3 = b[3]
  const b4 = b[4]
  const b5 = b[5]
  out[0] = a0 * b0 + a2 * b1
  out[1] = a1 * b0 + a3 * b1
  out[2] = a0 * b2 + a2 * b3
  out[3] = a1 * b2 + a3 * b3
  out[4] = a0 * b4 + a2 * b5 + a4
  out[5] = a1 * b4 + a3 * b5 + a5
  return out
}