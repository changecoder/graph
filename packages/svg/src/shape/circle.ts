import { ShapeAttrs } from '@cc/base'
import { each } from '@cc/util'
import { SVG_ATTR_MAP } from '../constants'
import Defs from '../defs'
import ShapeBase from './base'

export default class Circle extends ShapeBase {
  type: string = 'circle'

  getDefaultAttrs() {
    const attrs = super.getDefaultAttrs()
    return {
      ...attrs,
      x: 0,
      y: 0,
      r: 0
    }
  }

  createPath(context: Defs, targetAttrs?: ShapeAttrs) {
    const attrs = this.attr()
    const el = this.get('el')
    each(targetAttrs || attrs, (value, attr) => {
      // 圆和椭圆的点坐标属性不是 x, y，而是 cx, cy
      if (attr === 'x' || attr === 'y') {
        el.setAttribute(`c${attr}`, value)
      } else if (SVG_ATTR_MAP[attr]) {
        el.setAttribute(SVG_ATTR_MAP[attr], value)
      }
    })
  }
}