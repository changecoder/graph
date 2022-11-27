export function setTransform(model: {
  [key: string]: any
}) {
  const { matrix } = model.attr()
  if (matrix) {
    const el = model.cfg.el
    let transform: any = []
    for (let i = 0; i < 9; i += 3) {
      transform.push(`${matrix[i]},${matrix[i + 1]}`)
    }
    transform = transform.join(',')
    if (transform.indexOf('NaN') === -1) {
      el.setAttribute('transform', `matrix(${transform})`)
    } else {
      console.warn('invalid matrix:', matrix)
    }
  }
}