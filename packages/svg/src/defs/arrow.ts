import { isArray, uniqueId } from '@cc/util'
import Defs from '.'
import { createSVGElement } from '../util/dom'

export default class Arrow {
  id: string
  el: SVGMarkerElement
  child: SVGPathElement | any
  stroke: string
  canvas: SVGSVGElement | undefined
  parent: Defs | undefined
  cfg: {
    [key: string]: any
  } = {}

  constructor(attrs: any, type: string) {
    const el = createSVGElement('marker') as SVGMarkerElement
    const id = uniqueId('marker_')
    el.setAttribute('id', id)

    const shape = createSVGElement('path')
    shape.setAttribute('stroke', attrs.stroke || 'none')
    shape.setAttribute('fill', attrs.fill || 'none')
    el.appendChild(shape)
    el.setAttribute('overflow', 'visible')
    el.setAttribute('orient', 'auto')

    this.el = el
    this.child = shape
    this.id = id
    const cfg = attrs[type === 'marker-start' ? 'startArrow' : 'endArrow']
    this.stroke = attrs.stroke || '#000'

    if (cfg === true) {
      this.setDefaultPath(shape)
    } else {
      this.cfg = cfg // when arrow config exists
      this.setMarker(attrs.lineWidth, shape)
    }
    return this
  }

  setDefaultPath(el: SVGElement) {
    const parent = this.el
    // 默认箭头的边长为 10，夹角为 60 度
    el.setAttribute('d', `M0,0 L${10 * Math.cos(Math.PI / 6)},5 L0,10`)
    parent.setAttribute('refx', `${10 * Math.cos(Math.PI / 6)}`)
    parent.setAttribute('refy', `${5}`)
  }

  setMarker(r: number, el: SVGElement) {
    const parent = this.el
    let path = this.cfg.path
    const d = this.cfg.d

    if (isArray(path)) {
      path = path
        .map((segment) => {
          return segment.join(' ')
        })
        .join('')
    }
    el.setAttribute('d', path)
    parent.appendChild(el)
    if (d) {
      parent.setAttribute('refX', `${d / r}`)
    }
  }
}