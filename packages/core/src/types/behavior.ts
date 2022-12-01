import { IAbstractGraph } from '../interface'
import { CCGEvent } from './event'

export interface BehaviorOption {
  getEvents: () => {
    [key in CCGEvent]?: string
  }
  getDefaultCfg?: () => object
  bind?: (e: IAbstractGraph) => void
  unbind?: (e: IAbstractGraph) => void
  [key: string]: unknown
}