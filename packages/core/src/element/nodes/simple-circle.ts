import { IGroup, IShape } from '@cc/base'
import { deepMix } from '@cc/util'

import { ShapeOptions } from '../../interface'
import { NodeConfig, ShapeStyle } from '../../types'
import Shape from '../shape'
import Global from '../../global'


Shape.registerNode(
  'simple-circle',
  {
    // 自定义节点时的配置
    options: {
      size: Global.defaultNode.size,
      style: {
        x: 0,
        y: 0,
        stroke: Global.defaultNode.style.stroke,
        fill: Global.defaultNode.style.fill,
        lineWidth: Global.defaultNode.style.lineWidth
      }
    },
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
      const { style: defaultStyle } = this.getOptions!(cfg) || {}
      const strokeStyle = {
        stroke: cfg.color
      }
      // 如果设置了color，则覆盖默认的stroke属性
      const style = deepMix({}, defaultStyle, strokeStyle)
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