import { IGroup, IShape } from '@graph/base'
import { deepMix } from '@graph/util'
import { CLS_SHAPE_SUFFIX } from '../constants'
import { ShapeOptions } from '../interface/shape'
import { ModelConfig } from '../types'

export const shapeBase: ShapeOptions = {
  draw(cfg: ModelConfig, group: IGroup): IShape {
    group['shapeMap'] = {}
    const shape: IShape = this.drawShape!(cfg, group)
    shape.set('className', this.itemType + CLS_SHAPE_SUFFIX)
    group['shapeMap'][this.itemType + CLS_SHAPE_SUFFIX] = shape
    return shape
  },
  getCustomConfig(cfg: ModelConfig): ModelConfig {
    return {}
  },
  getOptions(cfg: ModelConfig): ModelConfig {
    return deepMix(
      {},
      this.options,
      this.getCustomConfig(cfg) || {},
      cfg
    )
  }
}