import { CCGGraphEvent } from '../interface'
import { ICCGGraphEvent, Item } from '../types'

export const cloneEvent = (e: ICCGGraphEvent): ICCGGraphEvent => {
  const event = new CCGGraphEvent(e.type, e)
  event.clientX = e.clientX
  event.clientY = e.clientY
  event.x = e.x
  event.y = e.y
  event.target = e.target
  event.currentTarget = e.currentTarget
  event.bubbles = true;
  (event.item as Item | null) = e.item
  return event
}