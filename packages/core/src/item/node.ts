import { each, isNil } from '@cc/util'
import { CACHE_ANCHOR_POINTS, CACHE_BBOX } from '../constants'
import { IEdge, INode } from '../interface'
import { IPoint, IShapeBase, ModelConfig, NodeConfig, UpdateType } from '../types'
import { getCircleIntersectByPoint, getRectIntersectByPoint } from '../util/graphic'
import { distance } from '../util/math'
import Item from './item'

export default class Node extends Item implements INode {
  public getDefaultCfg() {
    return {
      type: 'node',
      edges: []
    }
  }

  /**
   * 获取从节点关联的所有边
   */
  public getEdges(): IEdge[] {
    return this.get('edges')
  }

  /**
   * 获取所有的入边
   */
  public getInEdges(): IEdge[] {
    const self = this
    return this.get('edges').filter((edge: IEdge) => edge.get('target') === self)
  }
  
  /**
    * 获取所有的出边
    */
  public getOutEdges(): IEdge[] {
    const self = this
    return this.get('edges').filter((edge: IEdge) => edge.get('source') === self)
  }

  /**
   * add edge
   * @param edge Edge instance
   */
  public addEdge(edge: IEdge) {
    this.get('edges').push(edge)
  }

  /**
   * 移除边
   * @param {Edge} edge 边
   */
  public removeEdge(edge: IEdge) {
    const edges = this.getEdges()
    const index = edges.indexOf(edge)
    if (index > -1) {
      edges.splice(index, 1)
    }
  }

  /**
   * 获取锚点的位置
   * @return {array} anchorPoints
   */
  public getAnchorPoints(): IPoint[] {
    let anchorPoints: IPoint[] = this.get(CACHE_ANCHOR_POINTS)
    if (!anchorPoints) {
      anchorPoints = []
      const shapeFactory = this.get('shapeFactory')
      const bbox = this.getBBox()
      const model: NodeConfig = this.get('model')
      const shapeCfg = this.getShapeCfg(model)
      const type = model.type
      const points = shapeFactory.getAnchorPoints(type, shapeCfg) || []

      each(points, (pointArr: Array<number>, index: number) => {
        const point = {
          x: bbox.minX as number + pointArr[0] * (bbox.width as number),
          y: bbox.minY as number  + pointArr[1] * (bbox.height as number),
          anchorIndex: index
        }
        anchorPoints.push(point)
      })
      this.set(CACHE_ANCHOR_POINTS, anchorPoints)
    }
    return anchorPoints
  }

  /**
   * 获取连接点
   * @param point
   */
  public getLinkPoint(point: IPoint): IPoint | null {
    const keyShape: IShapeBase = this.get('keyShape')
    const type: string = keyShape.get('type')
    const itemType: string = this.get('type')
    let centerX: number | undefined
    let centerY: number | undefined
    const bbox = this.getBBox()
    if (itemType === 'combo') {
      console.log('combo暂不实现')
    } else {
      centerX = bbox.centerX
      centerY = bbox.centerY
    }
    const anchorPoints = this.getAnchorPoints()
    let intersectPoint: IPoint | null = null
    switch (type) {
    case 'circle':
      intersectPoint = getCircleIntersectByPoint(
        {
          x: centerX!,
          y: centerY!,
          r: bbox.width as number / 2
        },
        point
      )
      break
    default:
      intersectPoint = getRectIntersectByPoint(bbox as any, point)
      break
    }
    let linkPoint = intersectPoint
    // 如果存在锚点，则使用交点计算最近的锚点
    if (anchorPoints.length) {
      if (!linkPoint) {
        // 如果计算不出交点
        linkPoint = point
      }
      linkPoint = this.getNearestPoint(anchorPoints, linkPoint)
    }
    if (!linkPoint) {
      // 如果最终依然没法找到锚点和连接点，直接返回中心点
      linkPoint = { x: centerX, y: centerY } as IPoint
    }
    return linkPoint
  }

  /**
   * 判断更新的种类，move 表示仅移动，bbox 表示大小有变化，style 表示仅与大小无关的参数变化
   * @param cfg 节点数据模型
   */
  public getUpdateType(cfg?: ModelConfig): UpdateType {
    if (!cfg) {
      return undefined
    }

    const existX = !isNil(cfg.x)
    const existY = !isNil(cfg.y)

    const keys = Object.keys(cfg)

    // 仅有一个字段，包含 x 或者 包含 y
    // 两个字段，同时有 x，同时有 y
    if (
      (keys.length === 1 && (existX || existY)) ||
      (keys.length === 2 && existX && existY)
    ) {
      return 'move'
    }
  }

  /**
   * 获取最近的点
   * @param points 
   * @param curPoint 
   * @returns 
   */
  public getNearestPoint(points: IPoint[], curPoint: IPoint): IPoint {
    let index = 0
    let nearestPoint = points[0]
    let minDistance = distance(points[0], curPoint)
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const dis = distance(point, curPoint)
      if (dis < minDistance) {
        nearestPoint = point
        minDistance = dis
        index = i
      }
    }
    nearestPoint.anchorIndex = index
    return nearestPoint
  }

  public clearCache() {
    this.set(CACHE_BBOX, null) // 清理缓存的 bbox
    this.set(CACHE_ANCHOR_POINTS, null)
  }
}