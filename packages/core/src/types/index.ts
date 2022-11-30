
import { IShape } from '@cc/base'

import { IEdge, INode, ICombo } from '../interface/item'

export * from './event'

// Node Edge Combo 实例
export type Item = INode | IEdge | ICombo

export interface LayoutConfig {
  type?: string
  onLayoutEnd?: () => void
  [key: string]: unknown
}

export interface ModeOption {
  type: string
}

export type ModeType = string | ModeOption

export interface Modes {
  default?: ModeType[]
  [key: string]: ModeType[] | undefined
}

export interface GraphOptions {
  /**
   * 图的 DOM 容器，可以传入该 DOM 的 id 或者直接传入容器的 HTML 节点对象
   */
  container: string | HTMLElement
  /**
    * 指定画布宽度，单位为 'px'，可选，默认为容器宽度
    */
  width?: number
  /**
    * 指定画布高度，单位为 'px'，可选，默认为容器宽度
    */
  height?: number

  renderer?: string

  layout?: LayoutConfig
  /**
   * 当图中元素更新，或视口变换时，是否自动重绘。建议在批量操作节点时关闭，以提高性能，完成批量操作后再打开，参见后面的 setAutoPaint() 方法。
   * 默认值：true
   */
  autoPaint?: boolean
  /**
   * 设置画布的模式。
   */
  modes?: Modes
  /**
   * Edge 是否连接到节点中间
   */
  linkCenter?: boolean
}

export type ItemType = 'item' | 'node' | 'edge' | 'combo'

export interface IShapeBase extends IShape {
  isKeyShape: boolean
}

export interface ModelConfig {
  // 节点或边的类型
  type?: string
  label?: string
  x?: number
  y?: number
  size?: number | number[]
  color?: string
  anchorPoints?: number[][]
  startPoint?: {
    x: number
    y: number
  }
  endPoint?: {
    x: number
    y: number
  }
  visible?: boolean
  [key: string]: unknown
}


export interface NodeConfig extends ModelConfig {
  id: string
  comboId?: string
}

export interface ComboTree {
  id: string
  children?: ComboTree[]
  depth?: number
  parentId?: string
  itemType?: 'node' | 'combo'
  [key: string]: unknown
}

export interface ComboConfig extends ModelConfig {
  id: string
  parentId?: string
}

export interface EdgeConfig extends ModelConfig {
  id?: string
  source?: string
  target?: string
  sourceNode?: Node
  targetNode?: Node
  startPoint?: IPoint
  endPoint?: IPoint
  controlPoints?: IPoint[]
}

export interface IPoint {
  x: number
  y: number
  // 获取连接点时使用
  anchorIndex?: number
  [key: string]: number | undefined
}

export interface GraphData {
  nodes?: NodeConfig[]
  edges?: EdgeConfig[]
  combos?: ComboConfig[]
  [key: string]: any
}

export interface NodeMap {
  [key: string]: INode
}

// Shape types
export type ShapeStyle = Partial<{
  x: number
  y: number
  r: number
  radius: number
  width: number
  height: number
  offset: number | number[]
  stroke: string | null
  strokeOpacity: number
  fill: string | null
  fillOpacity: number
  lineWidth: number
  lineAppendWidth: number
  lineDash: number[]
  path: string | object[]
  points: object[]
  matrix: number[]
  opacity: number
  size: number | number[]
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  cursor: string
  position: string
  fontSize: number

  // support more properties
  [key: string]: any
}>

export interface Indexable<T> {
  [key: string]: T
}