import { LooseObject } from '@cc/base'
import { uniqueId } from '@cc/util'

import { createSVGElement } from '../util/dom'
import Arrow from './arrow'

export default class Defs {
  id: string
  defaultArrow: LooseObject
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

  addArrow(attrs: any, name: string) {
    const arrow = new Arrow(attrs, name)
    this.el.appendChild(arrow.el)
    this.add(arrow)
    return arrow.id
  }

  add(item: Arrow) {
    this.children.push(item)
    item.canvas = this.canvas
    item.parent = this
  }

  getDefaultArrow(attrs: any, name: string) {
    const stroke = attrs.stroke || attrs.strokeStyle
    if (this.defaultArrow[stroke]) {
      return this.defaultArrow[stroke].id
    }
    const arrow = new Arrow(attrs, name)
    this.defaultArrow[stroke] = arrow
    this.el.appendChild(arrow.el)
    this.add(arrow)
    return arrow.id
  }
}