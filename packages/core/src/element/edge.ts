import { IGroup, IShape, LooseObject, Point } from '@cc/base'
import { mix, isNumber, isArray } from '@cc/util'

import { ShapeOptions } from '../interface'
import Global from '../global'

import { each } from '@cc/util'
import { EdgeConfig, IPoint, Item, ModelConfig, ShapeStyle, UpdateType } from '../types'
import { CLS_SHAPE } from '../constants'
import { shapeBase } from './shapeBase'
import Shape from './shape'
import { getControlPoint } from '../util/graphic'


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
      if (index === 0) 
      {path.push(['M', point.x, point.y])}
      else 
      {path.push(['L', point.x, point.y])}
      
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
    if (controlPoints) 
    {points = points.concat(controlPoints)}
    
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
    let style: any = {}
    if (updateType === 'move') {
      style = { path }
    } else {
      style = { ...cfg.style }
      if (style.lineWidth === undefined) {
        style.lineWdith = (isNumber(size) ? size : (size as number[])?.[0]) || currentAttr.lineWidth
      }
      
      if (style.path === undefined) {
        style.path = path
      }
      
      if (style.stroke === undefined) {
        style.stroke = currentAttr.stroke || cfg.color
      }
       
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
    if (controlPoints) 
    {points = points.concat(controlPoints)}
    
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
    getControlPoints(): any {
      return undefined
    },
  },
  'single-edge'
)
// 二次贝塞尔曲线
Shape.registerEdge(
  'quadratic',
  {
    curvePosition: 0.5, // 弯曲的默认位置
    curveOffset: -20, // 弯曲度，沿着 startPoint, endPoint 的垂直向量（顺时针）方向，距离线的距离，距离越大越弯曲
    getControlPoints(cfg: EdgeConfig): IPoint[] {
      let { controlPoints } = cfg // 指定controlPoints
      if (!controlPoints || !controlPoints.length) {
        const { startPoint, endPoint } = cfg
        if (cfg.curveOffset === undefined) 
        {cfg.curveOffset = this.curveOffset}
        
        if (cfg.curvePosition === undefined) {
          cfg.curvePosition = this.curvePosition
        }
        if (isArray(this.curveOffset)) {
          cfg.curveOffset = (cfg.curveOffset as Array<number>)[0]
        }
        if (isArray(this.curvePosition)) {
          cfg.curvePosition = (cfg.curveOffset as Array<number>)[0]
        }
        const innerPoint = getControlPoint(
          startPoint as Point,
          endPoint as Point,
          cfg.curvePosition as number,
          cfg.curveOffset as number,
        )
        controlPoints = [innerPoint]
      }
      return controlPoints
    },
    getPath(points: Point[]): Array<Array<string | number>> {
      const path = []
      path.push(['M', points[0].x, points[0].y])
      path.push(['Q', points[1].x, points[1].y, points[2].x, points[2].y])
      return path
    },
  },
  'single-edge'
)

// 三阶贝塞尔曲线
Shape.registerEdge(
  'cubic',
  {
    curvePosition: [1 / 2, 1 / 2],
    curveOffset: [-20, 20],
    getControlPoints(cfg: EdgeConfig): IPoint[] {
      let { controlPoints } = cfg // 指定 controlPoints
      if (cfg.curveOffset === undefined) {
        cfg.curveOffset = this.curveOffset
      }
      if (cfg.curvePosition === undefined) {
        cfg.curvePosition = this.curvePosition
      }
      if (isNumber(cfg.curveOffset)) {
        cfg.curveOffset = [cfg.curveOffset, -cfg.curveOffset]
      }
      if (isNumber(cfg.curvePosition)) {
        cfg.curvePosition = [cfg.curvePosition, 1 - cfg.curvePosition]
      }
      if (!controlPoints || !controlPoints.length || controlPoints.length < 2) {
        const { startPoint, endPoint } = cfg
        const innerPoint1 = getControlPoint(
          startPoint as Point,
          endPoint as Point,
          (cfg.curvePosition as Array<number>)[0],
          (cfg.curveOffset as Array<number>)[0],
        )
        const innerPoint2 = getControlPoint(
          startPoint as Point,
          endPoint as Point,
          (cfg.curvePosition as Array<number>)[1],
          (cfg.curveOffset  as Array<number>)[1],
        )
        controlPoints = [innerPoint1, innerPoint2]
      }
      return controlPoints
    },
    getPath(points: Point[]): Array<Array<string | number>> {
      const path = []
      path.push(['M', points[0].x, points[0].y])
      path.push([
        'C',
        points[1].x,
        points[1].y,
        points[2].x,
        points[2].y,
        points[3].x,
        points[3].y,
      ])
      return path
    },
  },
  'single-edge'
)

// 水平方向的三阶贝塞尔曲线
Shape.registerEdge(
  'cubic-horizontal',
  {
    curvePosition: [1 / 2, 1 / 2],
    minCurveOffset: [0, 0],
    curveOffset: undefined,
    getControlPoints(cfg: EdgeConfig): IPoint[] {
      const { startPoint, endPoint } = cfg
      if (cfg.curvePosition === undefined) {
        cfg.curvePosition = this.curvePosition
      }
      if (cfg.curveOffset === undefined) {
        cfg.curveOffset = this.curveOffset
      }
      if (cfg.minCurveOffset === undefined) {
        cfg.minCurveOffset = this.minCurveOffset
      }
      if (isNumber(cfg.curveOffset)) {
        cfg.curveOffset = [cfg.curveOffset, -cfg.curveOffset]
      }
      if (isNumber(cfg.minCurveOffset)){
        cfg.minCurveOffset = [cfg.minCurveOffset, -cfg.minCurveOffset]
      }
      if (isNumber(cfg.curvePosition)){
        cfg.curvePosition = [cfg.curvePosition, 1 - cfg.curvePosition]
      }
      const xDist = endPoint!.x - startPoint!.x
      let curveOffset: number[] = [0, 0]
      if (cfg.curveOffset) {
        curveOffset = cfg.curveOffset
      } else if (Math.abs(xDist) < Math.abs((cfg.minCurveOffset as Array<number>)[0])) {
        curveOffset = cfg.minCurveOffset as Array<number>
      }

      const innerPoint1 = {
        x: startPoint!.x + xDist * (this as any).curvePosition[0] + curveOffset[0],
        y: startPoint!.y
      }
      const innerPoint2 = {
        x: endPoint!.x - xDist * (this as any).curvePosition[1] + curveOffset[1],
        y: endPoint!.y
      }
      const controlPoints = [innerPoint1, innerPoint2]
      return controlPoints
    },
  },
  'cubic'
)