import { IGroup, IShape } from '@graph/base'
import { ShapeOptions } from '../../interface/shape'
import { NodeConfig, ShapeStyle } from '../../types'
import Shape from '../shape'

Shape.registerNode(
  'simple-circle',
  {
    shapeType: 'simple-circle',
    shapeMap: {},
    drawShape(cfg: NodeConfig, group: IGroup): IShape {
      const name = `${(this as any).type}-keyShape`
      const style = (this as any).getShapeStyle!(cfg)
      const keyShape: IShape = group.addShape('circle', {
        attrs: style,
        className: `${(this as any).type}-keyShape`,
        name,
        draggable: true,
      })
      return keyShape
    },
    getShapeStyle(cfg: NodeConfig): ShapeStyle {
      const style = {}
      const size = (this as ShapeOptions).getSize!(cfg)
      const r = size[0] / 2
      const styles = {
        x: 0,
        y: 0,
        r,
        ...style
      }
      return styles
    },
  },
  'single-node'
)