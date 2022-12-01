import { AbstractShape, IShape, ShapeAttrs } from '@cc/base'
import { SVG_ATTR_MAP } from '../constants'

import Defs from '../defs'
import Group from '../group'
import { createDom } from '../util/dom'
import { setTransform } from '../util/svg'
import * as Shape from './index'

export default class ShapeBase extends AbstractShape implements IShape {
  type: string = 'svg'
  canFill: boolean = false
  canStroke: boolean = false

  getDefaultAttrs() {
    const attrs = super.getDefaultAttrs()
    // 设置默认值
    return {
      ...attrs,
      lineWidth: 1,
      lineAppendWidth: 0,
      strokeOpacity: 1,
      fillOpacity: 1
    }
  }

  getShapeBase() {
    return Shape
  }

  getGroupBase() {
    return Group
  }

  draw(context: Defs, targetAttrs?: ShapeAttrs) {
    const el = this.get('el')
    if (this.get('destroyed')) {
      if (el) {
        el.parentNode.removeChild(el)
      }
    } else {
      if (!el) {
        createDom(this)
      }
      this.createPath(context, targetAttrs)
      this.strokeAndFill(context, targetAttrs)
      this.transform(targetAttrs)
    }
  }

  strokeAndFill(context: Defs, targetAttrs?: ShapeAttrs) {
    const attrs = targetAttrs || this.attr()
    const { fill, fillStyle, stroke, strokeStyle, fillOpacity, strokeOpacity, lineWidth } = attrs
    const el = this.get('el')

    if (this.canFill) {
      // 初次渲染和更新渲染的逻辑有所不同: 初次渲染值为空时，需要设置为 none，否则就会是黑色，而更新渲染则不需要
      if (!targetAttrs) {
        this.setColor(context, 'fill', fill || fillStyle)
      } else if ('fill' in attrs) {
        this.setColor(context, 'fill', fill)
      } else if ('fillStyle' in attrs) {
        // compatible with fillStyle
        this.setColor(context, 'fill', fillStyle)
      }
      if (fillOpacity) {
        el.setAttribute(SVG_ATTR_MAP['fillOpacity'], fillOpacity)
      }
    }

    if (this.canStroke && lineWidth > 0) {
      if (!targetAttrs) {
        this.setColor(context, 'stroke', stroke || strokeStyle)
      } else if ('stroke' in attrs) {
        this.setColor(context, 'stroke', stroke)
      } else if ('strokeStyle' in attrs) {
        // compatible with strokeStyle
        this.setColor(context, 'stroke', strokeStyle)
      }
      if (strokeOpacity) {
        el.setAttribute(SVG_ATTR_MAP['strokeOpacity'], strokeOpacity)
      }
      if (lineWidth) {
        el.setAttribute(SVG_ATTR_MAP['lineWidth'], lineWidth)
      }
    }
  }

  setColor(context: Defs, attr: string, value: string) {
    const el = this.get('el')
    if (!value) {
      // need to set `none` to avoid default value
      el.setAttribute(SVG_ATTR_MAP[attr], 'none')
      return
    }
    el.setAttribute(SVG_ATTR_MAP[attr], value)
  }

  transform(targetAttrs?: ShapeAttrs) {
    const attrs = this.attr()
    const { matrix } = targetAttrs || attrs
    if (matrix) {
      setTransform(this)
    }
  }

  // 绘制图形的路径
  createPath(context: Defs, targetAttrs?: ShapeAttrs) {}

}