import GraphEvent from '../event/graph-event'
import { ICanvas, IContainer, IShape } from '../interfaces'

// 触发目标事件，目标只能是 shape 或 canvas
export function emitTargetEvent(target: IShape | ICanvas, type: string, eventObj: GraphEvent) {
  eventObj.name = type
  eventObj.target = target
  eventObj.currentTarget = target
  target.emit(type, eventObj)
}

// 事件冒泡, enter 和 leave 需要对 fromShape 和 toShape 进行判同
export function bubbleEvent(container: IContainer, type: string, eventObj: GraphEvent) {
  if (eventObj.bubbles) {
    let isOverEvent = false
    if (type === 'mouseenter') {
      isOverEvent = true
    } else if (type === 'mouseleave') {
      isOverEvent = true
    }
    // canvas 上的 mouseenter， mouseleave 事件，仅当进入或者移出 canvas 时触发
    if (container.isCanvas() && isOverEvent) {
      return
    }
    // 事件名称可能在委托过程中被修改，因此事件冒泡时需要重新设置事件名称
    eventObj.name = type
    container.emit(type, eventObj)
  }
}