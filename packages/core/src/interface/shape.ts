import { ModelConfig } from '../types'

export type ShapeDefine = string | ((cfg: ModelConfig) => string)

export type ShapeOptions = Partial<{
  options: ModelConfig

  // 形状的类型
  type: string
  itemType: string
  shapeType: string

  //
  getOptions: (cfg: ModelConfig) => ModelConfig

  [key: string]: any
}>