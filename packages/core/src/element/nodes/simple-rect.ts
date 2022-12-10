import { mix } from '@cc/util'
import { IGroup, IShape } from '@cc/base'

import Shape from '../shape'
import Global from '../../global'
import { NodeConfig, ShapeStyle } from '../../types'
import { ShapeOptions } from '../../interface'

Shape.registerNode(
  'simple-rect',
  {
    // 自定义节点时的配置
    options: {
      size: [100, 30],
      style: {
        radius: 0,
        stroke: Global.defaultNode.style.stroke,
        fill: Global.defaultNode.style.fill,
        lineWidth: Global.defaultNode.style.lineWidth
      }
    },
    shapeType: 'simple-rect',
    drawShape(cfg: NodeConfig, group: IGroup): IShape {
      const style = this.getShapeStyle!(cfg)

      const keyShape = group.addShape('rect', {
        attrs: style,
        className: `${this.type}-keyShape`,
        name: `${this.type}-keyShape`,
        draggable: true,
      })

      return keyShape
    },
    /**
     * 获取节点的样式，供基于该节点自定义时使用
     * @param {Object} cfg 节点数据模型
     * @return {Object} 节点的样式
     */
    getShapeStyle(cfg: NodeConfig) {
      const { style: defaultStyle } = this.mergeStyle || this.getOptions!(cfg) as NodeConfig
      const strokeStyle: ShapeStyle = {
        stroke: cfg.color,
      }
      // 如果设置了color，则覆盖默认的stroke属性
      const style = mix({}, defaultStyle, strokeStyle)
      const size = (this as ShapeOptions).getSize!(cfg)
      const width = (style as any).width || size[0]
      const height = (style as any).height || size[1]
      const styles = {
        x: -width / 2,
        y: -height / 2,
        width,
        height,
        ...style,
      }
      return styles
    }
  },
  'single-node'
)