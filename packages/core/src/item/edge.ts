import { isNil, isPlainObject } from '@cc/util'
import { ANCHOR_NAME_SUFFIX, END_MAP, ITEM_NAME_SUFFIX, POINT_NAME_SUFFIX } from '../constants'
import { IEdge, INode } from '../interface'
import { EdgeConfig, IPoint, NodeConfig, SourceTarget, UpdateType } from '../types'
import Item from './item'

export default class Edge extends Item implements IEdge {
  protected getDefaultCfg() {
    return {
      type: 'edge',
      sourceNode: null as NodeConfig,
      targetNode: null as NodeConfig,
      startPoint: null as NodeConfig | IPoint,
      endPoint: null as NodeConfig | IPoint,
      linkCenter: false
    }
  }

  private setEnd(name: SourceTarget, value: any) {
    const pointName = END_MAP[name] + POINT_NAME_SUFFIX
    const itemName = name + ITEM_NAME_SUFFIX
    const preItem = this.get(itemName)
    if (preItem && !preItem.destroyed) {
      // 如果之前存在节点，则移除掉边
      preItem.removeEdge(this)
    }

    if (isPlainObject(value)) {
      // 如果设置成具体的点，则清理节点
      this.set(pointName, value)
      this.set(itemName, null)
    } else if (value) {
      value!.addEdge(this)
      this.set(itemName, value)
      this.set(pointName, null)
    }
  }
  
  private getEndCenter(name: SourceTarget): IPoint {
    const itemName = name + ITEM_NAME_SUFFIX
    const pointName = END_MAP[name] + POINT_NAME_SUFFIX
    const item = this.get(itemName)
    // 如果有端点，直接使用 model
    if (item) {
      const bbox = item.getBBox()
      return {
        x: bbox.centerX,
        y: bbox.centerY
      }
    } // 否则直接使用点
    return this.get(pointName)
  }

  /**
   * 通过端点的中心获取控制点
   * @param model
   */
  private getControlPointsByCenter(model: EdgeConfig) {
    const sourcePoint = this.getEndPoint('source')
    const targetPoint = this.getEndPoint('target')
    const shapeFactory = this.get('shapeFactory')
    const type = model.type
    return shapeFactory.getControlPoints(type, {
      startPoint: sourcePoint,
      endPoint: targetPoint
    })
  }

  /**
   * 获取端点的位置
   * @param name
   */
  private getEndPoint(name: SourceTarget): NodeConfig | IPoint {
    const itemName = name + ITEM_NAME_SUFFIX
    const pointName = END_MAP[name] + POINT_NAME_SUFFIX
    const item = this.get(itemName)
    // 如果有端点，直接使用 model
    if (item) {
      return item.get('model')
    } // 否则直接使用点
    return this.get(pointName)
  }

  /**
   * 获取连接点的坐标
   * @param name source | target
   * @param model 边的数据模型
   * @param controlPoints 控制点
   */
  private getLinkPoint(name: SourceTarget, model: EdgeConfig, controlPoints: IPoint[]): IPoint {
    const pointName = END_MAP[name] + POINT_NAME_SUFFIX
    const itemName = name + ITEM_NAME_SUFFIX
    let point = this.get(pointName)
    if (!point) {
      const item = this.get(itemName)
      const anchorName = name + ANCHOR_NAME_SUFFIX
      const prePoint = this.getPrePoint(name, controlPoints)
      const anchorIndex = model[anchorName]
      if (!isNil(anchorIndex)) {
        // 如果有锚点，则使用锚点索引获取连接点
        console.log('未实现锚点获取')
      }
      // 如果锚点没有对应的点或者没有锚点，则直接计算连接点
      point = point || item.getLinkPoint(prePoint)
      if (!isNil(point.index)) {
        this.set(`${name}AnchorIndex`, point.index)
      }
    }
    return point
  }

  /**
   * 获取同端点进行连接的点，计算交汇点
   * @param name
   * @param controlPoints
   */
  private getPrePoint(name: SourceTarget, controlPoints: IPoint[]): NodeConfig | IPoint {
    if (controlPoints && controlPoints.length) {
      const index = name === 'source' ? 0 : controlPoints.length - 1
      return controlPoints[index]
    }
    const oppositeName = name === 'source' ? 'target' : 'source' // 取另一个节点的位置
    return this.getEndPoint(oppositeName)
  }

  protected init() {
    super.init()
    // 初始化两个端点
    this.setSource(this.get('source'))
    this.setTarget(this.get('target'))
  }

  public getShapeCfg(model: EdgeConfig, updateType?: UpdateType): EdgeConfig {
    // 判断是否以中心点为标准，或者使用锚点
    // 更新设置startPoint, endPoint , sourceNode , targetNode
    const linkCenter: boolean = this.get('linkCenter') // 如果连接到中心，忽视锚点、忽视控制点
    const cfg = updateType?.includes('move') ? model : super.getShapeCfg(model) as EdgeConfig
    
    if (linkCenter) {
      cfg.startPoint = this.getEndCenter('source')
      cfg.endPoint = this.getEndCenter('target')
    } else {
      const controlPoints = cfg.controlPoints || this.getControlPointsByCenter(cfg)
      cfg.startPoint = this.getLinkPoint('source', model, controlPoints)
      cfg.endPoint = this.getLinkPoint('target', model, controlPoints)
    }

    cfg.sourceNode = this.get('sourceNode')
    cfg.targetNode = this.get('targetNode')

    return cfg
  }
  
  public getSource(): INode {
    return this.get('source')
  }

  public getTarget(): INode {
    return this.get('target')
  }

  public setSource(source: INode) {
    this.setEnd('source', source)
    this.set('source', source)
  }

  public setTarget(target: INode) {
    this.setEnd('target', target)
    this.set('target', target)
  }

  public updatePosition() {
    return false
  }

  /**
   * 边不需要重计算容器位置，直接重新计算 path 位置
   * @param {object} cfg 待更新数据
   */
  public update(cfg: EdgeConfig, updateType: UpdateType = undefined) {
    console.log('------edge cfg-------', cfg)
  }

  public destroy() {
    const sourceItem: INode = this.get(`source${ITEM_NAME_SUFFIX}`)
    const targetItem: INode = this.get(`target${ITEM_NAME_SUFFIX}`)
    if (sourceItem && !sourceItem.destroyed) {
      sourceItem.removeEdge(this)
    }

    if (targetItem && !targetItem.destroyed) {
      targetItem.removeEdge(this)
    }
    super.destroy()
  }
}