import { each } from '@graph/util'
import { EVENTS, LEFT_BTN_CODE } from '../constants'
import { ICanvas, IShape, StringKeyObject } from '../interfaces'
import { bubbleEvent, emitTargetEvent } from '../util/event'
import GraphEvent from './graph-event'

export default class EventController {
  // 画布容器
  private canvas: ICanvas | undefined
  // 正在被拖拽的图形
  private draggingShape: IShape | undefined
  // 是否正在拖拽
  private dragging: boolean = false
  // 当前鼠标所在位置的图形
  private currentShape: IShape | undefined
  // 鼠标点击后所在位置的图形
  private mousedownShape: IShape | undefined
  // 最后一次鼠标点击后的时间戳
  private mousedownTimeStamp: number | undefined

  constructor(cfg: { canvas: ICanvas }) {
    this.canvas = cfg.canvas
  }

  init() {
    this.bindEvents()
  }

  // 注册事件
  bindEvents() {
    const el = this.canvas?.get('el')

    each(EVENTS, (eventName) => {
      el.addEventListener(eventName, this.eventCallback)
    })

    if (document) {
      // 处理拖拽到外部的问题
      document.addEventListener('mousemove', this.onDocumentMove)
      // 处理拖拽过程中在外部释放鼠标的问题
      document.addEventListener('mouseup', this.onDocumentMouseUp)
    }
  }

  // 在 document 处理拖拽到画布外的事件，处理从图形上移除画布未被捕捉的问题
  onDocumentMove = (ev: Event) => {
    const canvas = this.canvas
    const el = canvas?.get('el')
    if (el !== ev.target) {
      // 不在 canvas 上移动
      if (this.dragging || this.currentShape) {
        // 还在拖拽过程中
        if (this.dragging) {
          this.emitEvent('drag', ev, this.draggingShape)
        }
      }
    }
  }

  // 在 document 上处理拖拽到外面，释放鼠标时触发 dragend
  onDocumentMouseUp = (ev: Event) => {
    const canvas = this.canvas
    const el = canvas?.get('el')
    if (el !== ev.target) {
      // 不在 canvas 上移动
      if (this.dragging) {
        if (this.draggingShape) {
          // 如果存在拖拽的图形，则也触发 drop 事件
          this.emitEvent('drop', ev, undefined)
        }
        this.emitEvent('dragend', ev, this.draggingShape)
        this.afterDrag(this.draggingShape, ev)
      }
    }
  }

  // drag 完成后，需要做一些清理工作
  afterDrag(draggingShape: IShape | undefined, event: Event) {
    if (draggingShape) {
      draggingShape.set('capture', true) // 恢复可以拾取
      this.draggingShape = undefined
    }
    this.dragging = false
    // drag 完成后，有可能 draggingShape 已经移动到了当前位置，所以不能直接取当前图形
    const shape = this.getShape(event)
    this.currentShape = shape // 更新当前 shape，如果不处理当前图形的 mouseleave 事件可能会出问题
  }

  // 事件回调
  eventCallback = (ev: MouseEvent) => {
    const type = ev.type
    this.triggerEvent(type, ev)
  }

  triggerEvent(type: string, ev: MouseEvent) {
    const shape = this.getShape(ev)
    const method = (this as StringKeyObject)[`on${type}`]
    if (method) {
      method.call(this, shape, ev)
    } else {
      // 如果进入、移出画布时存在图形，需要作出处理
    }
  }

  // 记录下点击的位置、图形，便于拖拽事件、click 事件的判定
  onmousedown(shape: IShape, ev: MouseEvent) {
    // 只有鼠标左键的 mousedown 事件才会设置 mousedownShape 等属性，避免鼠标右键的 mousedown 事件引起其他事件发生
    if (ev.button === LEFT_BTN_CODE) {
      this.mousedownShape = shape
      this.mousedownTimeStamp = ev.timeStamp
    }
    this.emitEvent('mousedown', ev, shape)
  }

  // 触发事件
  emitEvent(type: string, event: Event, shape?: IShape) {
    const eventObj = this.getEventObj(type, event, shape)
    // 存在 shape 触发，则进行冒泡处理
    if (shape) {
      eventObj.shape = shape
      // 触发 shape 上的事件
      emitTargetEvent(shape, type, eventObj)
      let parent = shape.getParent()
      // 执行冒泡
      while (parent) {
        // 委托事件要先触发
        parent.emitDelegation(type, eventObj)
        // 事件冒泡停止，不能妨碍委托事件
        if (!eventObj.propagationStopped) {
          bubbleEvent(parent, type, eventObj)
        }
        eventObj.propagationPath.push(parent)
        parent = parent.getParent()
      }
    } else {
      // 如果没有 shape 直接在 canvas 上触发
      const canvas = this.canvas
      if (canvas) {
        // 直接触发 canvas 上的事件
        emitTargetEvent(canvas, type, eventObj)
      }
    }
  }

  getEventObj(type: string, event: Event, target: IShape) {
    const eventObj = new GraphEvent(type, event)

    eventObj.propagationPath.push(target)

    return eventObj
  }

  // 根据点获取图形，提取成独立方法，便于后续优化
  getShape(ev: Event) {
    return this.canvas?.getShape(ev)
  }

  // 清理事件
  clearEvents() {
    const el = this.canvas?.get('el')
    each(EVENTS, (eventName) => {
      el.removeEventListener(eventName, this.eventCallback)
    })
    if (document) {
      document.removeEventListener('mousemove', this.onDocumentMove)
      document.removeEventListener('mouseup', this.onDocumentMouseUp)
    }
  }

  destroy() {
    // 清理事件
    this.clearEvents()
    // 清理缓存的对象
    this.canvas = undefined
    this.currentShape = undefined
    this.draggingShape = undefined
    this.mousedownShape = undefined
    this.mousedownTimeStamp = undefined
  }
}