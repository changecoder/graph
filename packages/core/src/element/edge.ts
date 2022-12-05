import { IGroup, IShape, LooseObject, Point } from '@cc/base'
import { mix, isNumber } from '@cc/util'

import { ShapeOptions } from '../interface'
import Global from '../global'

import { each } from '@cc/util'
import { EdgeConfig, IPoint, Item, ModelConfig, ShapeStyle, UpdateType } from '../types'
import { CLS_SHAPE } from '../constants'
import { shapeBase } from './shapeBase'
import Shape from './shape'


const singleEdge: ShapeOptions = {
  itemType: 'edge',

  // 自定义边时的配置
  options: {
    size: Global.defaultEdge.size,
    style: {
      x: 0,
      y: 0,
      stroke: Global.defaultEdge.style.stroke,
      lineAppendWidth: Global.defaultEdge.style.lineAppendWidth,
    }
  },

  /**
   * 获取边的 path
   * @internal 供扩展的边覆盖
   * @param  {Array} points 构成边的点的集合
   * @return {Array} 构成 path 的数组
   */
  getPath(points: Point[]): Array<Array<string | number>> {
    const path: Array<Array<string | number>> = []
    each(points, (point: Point, index: number) => {
      if (index === 0) {
        path.push(['M', point.x, point.y])
      } else {
        path.push(['L', point.x, point.y])
      }
    })
    return path
  },

  // 处理需要重计算点和边的情况
  getPathPoints(cfg: EdgeConfig): EdgeConfig {
    return cfg
  },

  // 获取边的控制点
  getControlPoints(cfg: EdgeConfig): IPoint[] | undefined {
    return cfg.controlPoints
  },
  
  updateShapeStyle(cfg: EdgeConfig, item: Item, updateType?: UpdateType) {
    const group = item.getContainer()
    const shape = item.getKeyShape?.() || group['shapeMap']['edge-shape']

    const { size } = cfg
    cfg = this.getPathPoints!(cfg)

    const { startPoint, endPoint } = cfg

    const controlPoints = this.getControlPoints!(cfg)
    let points = [startPoint] // 添加起始点
    // 添加控制点
    if (controlPoints) {
      points = points.concat(controlPoints)
    }
    // 添加结束点
    points.push(endPoint)

    const currentAttr = shape.attr()
    const previousStyle = cfg.style || {}
    if (previousStyle.stroke === undefined) {
      previousStyle.stroke = cfg.color
    }
    const source = cfg.sourceNode
    const target = cfg.targetNode
    let routeCfg: { [key: string]: unknown } = { radius: previousStyle.radius }
    if (!controlPoints) {
      routeCfg = { source, target, offset: previousStyle.offset, radius: previousStyle.radius }
    }
    const path = (this as any).getPath(points, routeCfg)
    const style = { ...cfg.style }
    if (style.lineWidth === undefined) {
      style.lineWdith = (isNumber(size) ? size : (size as number[])?.[0]) || currentAttr.lineWidth
    }
    if (style.path === undefined) {
      style.path = path
    }
    if (style.stroke === undefined) {
      style.stroke = currentAttr.stroke || cfg.color
    } 
    if (shape) {
      shape.attr(style)
    }
  },

  getShapeStyle(cfg: EdgeConfig): ShapeStyle {
    const { style: defaultStyle } = this.options as ModelConfig
    const strokeStyle: ShapeStyle = {
      stroke: cfg.color,
    }
    const style: ShapeStyle = mix({}, defaultStyle as LooseObject, strokeStyle, cfg.style as LooseObject)
    const size = cfg.size || Global.defaultEdge.size
    cfg = this.getPathPoints!(cfg)
    const { startPoint, endPoint } = cfg
    const controlPoints = this.getControlPoints!(cfg)
    let points = [startPoint] // 添加起始点
    // 添加控制点
    if (controlPoints) {
      points = points.concat(controlPoints)
    }
    // 添加结束点
    points.push(endPoint)
    const path = (this as any).getPath(points)
    const styles = mix(
      {},
      Global.defaultEdge.style as ShapeStyle,
      {
        stroke: Global.defaultEdge.color,
        lineWidth: size,
        path,
      } as ShapeStyle,
      style
    )
    return styles
  },

  /**
   * 绘制边
   * @override
   * @param  {Object} cfg   边的配置项
   * @param  {G.Group} group 边的容器
   * @return {IShape} 图形
   */
  drawShape(cfg: EdgeConfig, group: IGroup): IShape {
    const shapeStyle = this.getShapeStyle!(cfg)
    const shape = group.addShape('path', {
      className: CLS_SHAPE,
      name: CLS_SHAPE,
      attrs: shapeStyle
    })
    group['shapeMap'][CLS_SHAPE] = shape
    return shape
  }
}

const singleEdgeDef = { ...shapeBase, ...singleEdge }
Shape.registerEdge('single-edge', singleEdgeDef)

// 直线, 不支持控制点
Shape.registerEdge(
  'line',
  {
    // 控制点不生效
    getControlPoints() {
      return undefined
    },
  },
  'single-edge'
)