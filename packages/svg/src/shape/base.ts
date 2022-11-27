import { AbstractShape, IShape } from '@graph/base'
import Group from '../group'

import * as Shape from './index'

export default class ShapeBase extends AbstractShape implements IShape {
  type: string = 'svg'

  getShapeBase() {
    return Shape
  }

  getGroupBase() {
    return Group
  }
}