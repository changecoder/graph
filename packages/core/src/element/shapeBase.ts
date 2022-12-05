import { IGroup, IShape } from '@cc/base'
import { deepMix } from '@cc/util'
import { CLS_SHAPE_SUFFIX } from '../constants'
import { ShapeOptions } from '../interface/shape'
import { Item, ModelConfig, UpdateType } from '../types'

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
  },
  update(cfg: ModelConfig, item: Item, updateType?: UpdateType) {
    (this as any).updateShapeStyle(cfg, item, updateType)
  }
}