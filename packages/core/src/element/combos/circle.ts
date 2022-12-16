import { LooseObject } from '@cc/base'
import { IGroup, IShape } from '@cc/base'
import { isArray, isNumber, mix } from '@cc/util'
import Global from '../../global'
import { ShapeOptions } from '../../interface'
import { ComboConfig, Item, ShapeStyle } from '../../types'
import Shape from '../shape'

// 圆形 Combo
Shape.registerCombo(
  'circle',
  {
    // 自定义节点时的配置
    options: {
      size: [Global.defaultCombo.size[0], Global.defaultCombo.size[0]],
      padding: Global.defaultCombo.padding[0],
      style: {
        stroke: Global.defaultCombo.style.stroke,
        fill: Global.defaultCombo.style.fill,
        lineWidth: Global.defaultCombo.style.lineWidth
      }
    },
    shapeType: 'circle',
    drawShape(cfg: ComboConfig, group: IGroup): IShape {
      const style = this.getShapeStyle!(cfg)
      delete style.height
      delete style.width
      const keyShape: IShape = group.addShape('circle', {
        attrs: style,
        className: 'circle-combo',
        name: 'circle-combo',
        draggable: true,
      })

      return keyShape
    },
    getShapeStyle(cfg: ComboConfig): ShapeStyle {
      const { style: defaultStyle } = this.options as ComboConfig
      let padding = (cfg.padding || (this.options as ComboConfig).padding) as number | number[]
      if (isArray(padding)) {
        padding = (padding as Array<number>)[0]
      }
      const strokeStyle: ShapeStyle = {
        stroke: cfg.color,
      }

      // 如果设置了color，则覆盖默认的stroke属性
      const style = mix({}, defaultStyle, strokeStyle, cfg.style) as LooseObject
      const fixSize = cfg.collapsed && cfg.fixCollapseSize ? cfg.fixCollapseSize : cfg.fixSize
      let r: number
      if (fixSize) {
        r = isNumber(fixSize) ? fixSize as number : (fixSize as Array<number>)[0]
      } else {
        const size = (this as ShapeOptions).getSize!(cfg)
        if (!isNumber(style.r) || isNaN(style.r)) {
          r = size[0] / 2 || Global.defaultCombo.style.r
        }
        else {
          r = Math.max(style.r, size[0] / 2) || size[0] / 2
        }
      }

      style.r = r + (padding as number)
      const styles = {
        x: 0,
        y: 0,
        ...style,
      }
      if (cfg.style) {cfg.style.r = r}
      else {
        cfg.style = { r }
      }
      return styles
    },
    update(cfg: ComboConfig, item: Item) {
      console.log('暂未完成')
    }
  },
  'single-combo'
)