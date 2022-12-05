import { IGroup, Point } from '@cc/base'

import { ComboConfig, EdgeConfig, Indexable, IShapeBase, Item, ItemType, ModelConfig, NodeConfig, UpdateType } from '../types'

// item 的配置项
export type IItemBaseConfig = Partial<{
  id: string

  type: ItemType

  model: ModelConfig

  group: IGroup

  visible: boolean

  keyShape: IShapeBase

  source: string | Item
  target: string | Item

  linkCenter: boolean
}> & Indexable<any>

export interface IItemBase {
  _cfg: IItemBaseConfig | null

  destroyed: boolean

  // 节点的图形容器
  getContainer: () => IGroup

  // 节点的关键形状，用于计算节点大小，连线截距等
  getKeyShape: () => IShapeBase

  // 节点 / 边 / Combo 的数据模型
  getModel: () => NodeConfig | EdgeConfig | ComboConfig

  // 节点类型
  getType: () => ItemType

  // 获取 Item 的ID
  getID: () => string

  getShapeCfg: (model: ModelConfig, updateType?: UpdateType) => ModelConfig

  // 更新位置，避免整体重绘
  updatePosition: (cfg: Point) => boolean

  // 绘制元素
  draw: () => void

  // 显示元素
  show: () => void

  // 隐藏元素
  hide: () => void

  // 更改是否显示
  changeVisibility: (visible: boolean) => void

  /**
   * 刷新一般用于处理几种情况
   * 1. item model 在外部被改变
   * 2. 边的节点位置发生改变，需要重新计算边
   *
   * 因为数据从外部被修改无法判断一些属性是否被修改，直接走位置和 shape 的更新
   */
  refresh: (updateType?: UpdateType) => void

  // 是否可见
  isVisible: () => boolean

  get: <T = any>(key: string) => T
  set: <T = any>(key: string, value: T) => void

  destroy: () => void
}

export interface INode extends IItemBase {
  // 获取从节点关联的所有边
  getEdges: () => IEdge[]

  // 获取引入节点的边
  getInEdges: () => IEdge[]
   
  // 获取从节点引出的边
  getOutEdges: () => IEdge[]

  // 添加边
  addEdge: (edge: IEdge) => void

  // 移除边
  removeEdge: (edge: IEdge) => void
}

export interface ICombo extends INode {
}

export interface IEdge extends IItemBase {
  setSource: (source: INode) => void
  setTarget: (target: INode) => void
  getSource: () => INode
  getTarget: () => INode
}