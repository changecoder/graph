export interface Node {
  id: string
}

export interface Model {
  nodes?: Node[]
  hiddenNodes?: Node[]
}

export interface OutNode extends Node {
  x: number
  y: number
}

export type PointTuple = [number, number]

export interface RandomLayoutOptions {
  type: 'random'
  center?: PointTuple
  width?: number
  height?: number
  onLayoutEnd?: () => void
}