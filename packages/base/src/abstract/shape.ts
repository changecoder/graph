import { ShapeCfg } from '../types'
import Element from './element'

export default abstract class AbstractShape extends Element {
  constructor(cfg: ShapeCfg) {
    super(cfg)
  }
}