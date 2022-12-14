import { AbstractShape, IShape, ShapeAttrs, BBox, ChangeType } from '@cc/base'
import { SVG_ATTR_MAP } from '../constants'

import Defs from '../defs'
import Group from '../group'
import { createDom } from '../util/dom'
import { refreshElement } from '../util/draw'
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

  isStroke() {
    const { stroke, strokeStyle } = this.attr()
    return (stroke || strokeStyle) && this.canStroke
  }

  // 覆盖基类的 afterAttrsChange 方法
  afterAttrsChange(targetAttrs: ShapeAttrs) {
    super.afterAttrsChange(targetAttrs)
    const canvas = this.get('canvas')
    // 只有挂载到画布下，才对元素进行实际渲染
    if (canvas && canvas.get('autoDraw')) {
      const context = canvas.get('context')
      this.draw(context, targetAttrs)
    }
  }

  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {
    refreshElement(this, changeType)
  }
    
  calculateBBox(): BBox {
    const el = this.get('el')
    const bbox = el?.getBBox()
    if (bbox) {
      const { x, y, width, height } = bbox
      const lineWidth = this.getHitLineWidth()
      const halfWidth = lineWidth / 2
      const minX = x - halfWidth
      const minY = y - halfWidth
      const maxX = x + width + halfWidth
      const maxY = y + height + halfWidth
      return {
        x: minX,
        y: minY,
        minX,
        minY,
        maxX,
        maxY,
        width: width + lineWidth,
        height: height + lineWidth
      }
    }

    return {
      x: 0,
      y: 0,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    }
  }

  /**
   * 获取线拾取的宽度
   * @returns {number} 线的拾取宽度
   */
  getHitLineWidth() {
    const { lineWidth, lineAppendWidth } = this.attrs
    if (this.isStroke()) {
      return lineWidth + lineAppendWidth
    }
    return 0
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