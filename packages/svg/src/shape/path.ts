import { Point, ShapeAttrs } from '@cc/base'
import { each, isArray, isObject } from '@cc/util'
import { SVG_ATTR_MAP } from '../constants'
import defs from '../defs'
import ShapeBase from './base'

export default class Path extends ShapeBase {
  type: string = 'path'
  canFill: boolean = true
  canStroke: boolean = true

  getDefaultAttrs() {
    const attrs = super.getDefaultAttrs()
    return {
      ...attrs,
      startArrow: false,
      endArrow: false
    }
  }

  createPath(context: defs, targetAttrs: ShapeAttrs | undefined) {
    const attrs = this.attr()
    const el = this.get('el')
    each(targetAttrs || attrs, (value, attr) => {
      if (attr === 'path' && isArray(value)) {
        el.setAttribute('d', this.formatPath(value))
      } else if (attr === 'startArrow' || attr === 'endArrow') {
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

  formatPath(value: any[]) {
    const newValue = value
      .map((path: any[]) => {
        return path.join(' ')
      })
      .join('')
    if (~newValue.indexOf('NaN')) {
      return ''
    }
    return newValue
  }
}