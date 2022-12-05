import { BBox, ShapeCfg } from '../types'
import Element from './element'

export default abstract class AbstractShape extends Element {
  constructor(cfg: ShapeCfg) {
    super(cfg)
  }

  // 计算包围盒时，需要缓存，这是一个高频的操作
  getBBox(): BBox {
    let bbox = this.cfg.bbox
    if (!bbox) {
      bbox = this.calculateBBox()
      this.set('bbox', bbox)
    }
    return bbox
  }

  abstract calculateBBox(): BBox
}