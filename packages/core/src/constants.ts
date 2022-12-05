import { Indexable } from './types'

export enum ITEM_TYPE {
  NODE = 'node',
  EDGE  = 'edge',
  COMBO = 'combo'
}

export const CFG_PREFIX = 'default'

export const CLS_SHAPE_SUFFIX = '-shape'
export const CLS_SHAPE = 'edge-shape'

export const END_MAP: Indexable<string> = { source: 'start', target: 'end' }
export const ITEM_NAME_SUFFIX = 'Node' // 端点的后缀，如 sourceNode, targetNode
export const POINT_NAME_SUFFIX = 'Point' // 起点或者结束点的后缀，如 startPoint, endPoint
export const ANCHOR_NAME_SUFFIX = 'Anchor'

export const CACHE_BBOX = 'bboxCache'