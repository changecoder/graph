import { createSVGElement } from '../util/dom'
import { uniqueId } from '@graph/util'

export default class Defs {
  id: string
  defaultArrow: {}
  children: any[]
  el: SVGDefsElement
  canvas: SVGSVGElement

  constructor(canvas: SVGSVGElement) {
    const el = createSVGElement('defs') as SVGDefsElement
    const id = uniqueId('defs_')
    el.id = id
    canvas.appendChild(el)
    this.children = []
    this.defaultArrow = {}
    this.el = el
    this.id = id
    this.canvas = canvas
  }
}