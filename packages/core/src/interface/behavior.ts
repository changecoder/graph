import { Event as GraphEvent, ICanvas } from '@cc/base'

import { BehaviorOption, CCGEvent, ICCGGraphEvent, IShapeBase, Item } from '../types'
import { IAbstractGraph } from './graph'

export interface IBehavior {
  registerBehavior: (type: string, behavior: BehaviorOption) => void
  hasBehavior: (type: string) => boolean
  getBehavior: (type: string) => any
}

export interface IBehaviorOption {
  type: string;
  getEvents: () => {
    [key in CCGEvent]?: string
  }
  getDefaultCfg?: () => object
  bind?: (e: IAbstractGraph) => void
  unbind?: (e: IAbstractGraph) => void
}

export class CCGGraphEvent extends GraphEvent implements ICCGGraphEvent {
  public item: Item

  public target!: IShapeBase & ICanvas
  
  public wheelDelta: number;
  
  // eslint-disable-next-line no-undef
  [key: string]: unknown

  constructor(type: string, event: ICCGGraphEvent) {
    super(type, event)
    this.wheelDelta = event.wheelDelta
    this.item = event.item
  }
  x: number
  y: number
}