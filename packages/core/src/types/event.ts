import { ICanvas, Event as GraphEvent } from '@cc/base'

import { IShapeBase, Item } from '.'
import { GraphTimingEvents } from './timing'

export type CommonInteractionEvent = 'click' | 'dbclick' | 'mousedown' | 'mousemove' | 'mouseup' | 'wheel'

export type NodeInteractionEvent = 'click' | 'dbclick' | 'mousedown' | 'mousemove' | 'mouseup' | 'contextmenu'

export type EdgeInteractionEvent = 'click' | 'dbclick' | 'mousedown' | 'mousemove' | 'mouseup' | 'contextmenu'

export type ComboInteractionEvent = NodeInteractionEvent

export type CanvasInteractionEvent = 'click' | 'dbclick' | 'mousedown' | 'mousemove' | 'mouseup' | 'wheel' | 'contextmenu'

export type NodeEventType = `node:${NodeInteractionEvent}`
export type EdgeEventType = `edge:${EdgeInteractionEvent}`
export type ComboEventType = `combo:${ComboInteractionEvent}`
export type CanvasEventType = `canvas:${CanvasInteractionEvent}`

export type GraphTimingEventType = GraphTimingEvents

export type GEvent = NodeEventType | 
  EdgeEventType | 
  ComboEventType | 
  CanvasEventType | 
  GraphTimingEventType | 
  CommonInteractionEvent | 
  CommonInteractionEvent | 
  (string & {})

export interface IGGraphEvent extends GraphEvent {
  item: Item | null
  target: IShapeBase & ICanvas
  [key: string]: unknown
}