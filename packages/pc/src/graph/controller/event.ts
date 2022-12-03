import { ICanvas, IShape } from '@cc/base'
import { AbstractEvent, ICCGGraphEvent } from '@cc/core'
import { wrapBehavior } from '@cc/util'

import { Fun } from '../../types'

import Graph from '../graph'


export default class EventController extends AbstractEvent {
  public destroyed: boolean

  protected canvasHandler!: Fun
  
  protected dragging: boolean = false

  // 获取 shape 的 item 对象
  private static getItemRoot<T extends IShape>(shape: any): T {
    while (shape && !shape.get('item')) {
      shape = shape.get('parent')
    }
    return shape
  }

  constructor(graph: Graph) {
    super(graph)
    this.graph = graph
    this.destroyed = false
    this.initEvents()
  }

  protected initEvents() {
    const { graph } = this
    const canvas: ICanvas = graph.get('canvas')
    const el = canvas.get('el')

    const canvasHandler: Fun = wrapBehavior(this, 'onCanvasEvents') as Fun

    canvas.off('*').on('*', canvasHandler)
    this.canvasHandler = canvasHandler
  }

  /**
   * 处理 canvas 事件
   * @param evt 事件句柄
   */
  protected onCanvasEvents(evt: ICCGGraphEvent) {
    const { graph } = this
    const canvas = graph.get('canvas')
    const { target, type: eventType } = evt
    
    evt.currentTarget = graph

    if (target === canvas) {
      if (eventType === 'mousemove' || eventType === 'mouseleave') {
        this.handleMouseMove(evt, 'canvas')
      }
      evt.target = canvas
      evt.item = null

      graph.emit(eventType, evt)
      graph.emit(`canvas:${eventType}`, evt)
      return
    }

    const itemShape: IShape = EventController.getItemRoot(target)
    if (!itemShape) {
      graph.emit(eventType, evt)
      return
    }

    const item = itemShape.get('item')
    if (item.destroyed) {
      return
    }

    const type = item.getType()
    // 事件target是触发事件的Shape实例，item是触发事件的item实例
    evt.target = target
    evt.item = item

    //
    graph.emit(eventType, evt)

    if (evt.name && !evt.name.includes(':')) {
      graph.emit(`${type}:${eventType}`, evt)
    } else {
      graph.emit(evt.name, evt)
    }

    if (eventType === 'dragstart') {
      this.dragging = true
    }
    if (eventType === 'dragend') {
      this.dragging = false
    }
    if (eventType === 'mousemove') {
      this.handleMouseMove(evt, type)
    }
  }

  handleMouseMove(evt: ICCGGraphEvent, type: string) {
    // 暂不需要实现
  }

  /**
   * 在 graph 上面 emit 事件
   * @param itemType item 类型
   * @param eventType 事件类型
   * @param evt 事件句柄
   */
  private emitCustomEvent(itemType: string, eventType: string, evt: ICCGGraphEvent) {
    evt.type = eventType
    this.graph.emit(`${itemType}:${eventType}`, evt)
  }

  public destroy() {
    this.destroyed = true
  }
}
