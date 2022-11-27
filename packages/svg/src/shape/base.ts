import { AbstractShape, IShape, ShapeAttrs } from '@graph/base'
import Defs from '../defs'
import Group from '../group'
import { createDom } from '../util/dom'
import { setTransform } from '../util/svg'

import * as Shape from './index'

export default class ShapeBase extends AbstractShape implements IShape {
  type: string = 'svg'
  canFill: boolean = false
  canStroke: boolean = false

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
    console.warn('等待完成')
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