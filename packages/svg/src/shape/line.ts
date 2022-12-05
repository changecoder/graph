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
}