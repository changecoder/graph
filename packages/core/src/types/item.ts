import { BBox } from '@cc/base'
import { IPoint } from '.'
import { IEdge, INode, ICombo } from '../interface/item'

// Node Edge Combo 实例
export type Item = INode | IEdge | ICombo

export type SourceTarget = 'source' | 'target'
export type Id = string | Item | undefined

export type ItemType = 'item' | 'node' | 'edge' | 'combo'

export type UpdateType = 'move' | 'style' | undefined

export interface IBBox extends BBox {
  centerX?: number
  centerY?: number
  [key: string]: number | undefined
}

export interface ICircle extends IPoint {
  r: number
}