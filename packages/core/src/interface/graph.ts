import { EventEmitter, IGroup } from '@graph/base'

import { GraphData, GraphOptions, Item, ItemType, ModelConfig, GEvent, IGGraphEvent } from '../types'
import Graph from '../graph/graph'
import { ICombo, IEdge, INode } from './item'

export interface IAbstractGraph extends EventEmitter {
  getDefaultCfg: () => Partial<GraphOptions>
  get: <T = any>(key: string) => T
  set: <T = any>(key: string | object, value?: T) => Graph
  findById: (id: string) => Item

  // 获取 graph 的根图形分组
  getGroup: () => IGroup

  //
  refreshPositions: () => void

  /**
   * 显示元素
   * @param {Item} item 指定元素
   */
  showItem: (item: Item | string) => void

  /**
   * 隐藏元素
   * @param {Item} item 指定元素
   */
  hideItem: (item: Item | string) => void

  // 仅画布重新绘制
  paint: () => void

  // 自动重绘
  autoPaint: () => void

  // 新增元素
  addItem: (type: ItemType, model: ModelConfig) => Item | boolean

  // 批量添加元素
  addItems: (items: { type: ItemType, model: ModelConfig }[]) => (Item | boolean)[]

  // 设置视图初始化数据
  data: (data?: GraphData) => void

  // 根据data接口的数据渲染视图
  render: () => void

  // 获取当前图中所有节点的item实例
  getNodes: () => INode[]

  // 获取当前图中所有边的item实例
  getEdges: () => IEdge[]
  
  // 获取当前图中所有 combo 的实例
  getCombos: () => ICombo[]

  // 切换行为模式
  setMode: (mode: string) => Graph

  // 清除画布元素
  clear: (avoidEmit?: boolean) => Graph

  // 重新以当前示例中配置的属性进行一次布局
  layout: () => void

  // 重新定义监听函数，复写参数类型
  on: <T = IGGraphEvent>(eventName: GEvent, callback: (e: T) => void, once?: boolean) => this

  // 移除指定的監聽函數
  off: <T = IGGraphEvent>(eventName: GEvent, callback: (e: T) => void, once?: boolean) => this

  // 销毁画布
  destroy: () => void
}