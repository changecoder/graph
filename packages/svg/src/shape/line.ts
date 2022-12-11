import { ShapeAttrs } from '@cc/base'
import { each, isObject } from '@cc/util'
import { SVG_ATTR_MAP } from '../constants'
import defs from '../defs'
import ShapeBase from './base'

export default class Line extends ShapeBase {
  type: string = 'line'
  canFill: boolean = false
  canStroke: boolean = true

  getDefaultAttrs() {
    const attrs = super.getDefaultAttrs()
    return {
      ...attrs,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      startArrow: false,
      endArrow: false
    }
  }

  createPath(context: defs, targetAttrs: ShapeAttrs | undefined) {
    const attrs = this.attr()
    const el = this.get('el')
    each(targetAttrs || attrs, (value, attr) => {
      if (attr === 'startArrow' || attr === 'endArrow') {
        if (value) {
          const id = isObject(value)
            ? context.addArrow(attrs, SVG_ATTR_MAP[attr])
            : context.getDefaultArrow(attrs, SVG_ATTR_MAP[attr])
          el.setAttribute(SVG_ATTR_MAP[attr], `url(#${id})`)
        } else {
          el.removeAttribute(SVG_ATTR_MAP[attr])
        }
      } else if (SVG_ATTR_MAP[attr]) {
        el.setAttribute(SVG_ATTR_MAP[attr], value)
      }
    })
  }
}