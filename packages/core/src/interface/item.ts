import { IGroup, Point } from '@cc/base'

import { ComboConfig, EdgeConfig, Indexable, IShapeBase, Item, ItemType, ModelConfig, NodeConfig } from '../types'

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

  // 是否可见
  isVisible: () => boolean

  get: <T = any>(key: string) => T
  set: <T = any>(key: string, value: T) => void

  destroy: () => void
}

export interface INode extends IItemBase {
}

export interface ICombo extends INode {
}

export interface IEdge extends IItemBase {
}