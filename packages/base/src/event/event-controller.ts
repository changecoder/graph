import { each } from '@graph/util'
import { CLICK_OFFSET, EVENTS, LEFT_BTN_CODE } from '../constants'
import { ICanvas, IShape, StringKeyObject, PointInfo } from '../interfaces'
import { Point } from '../types'
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
  // 鼠标所在Point
  private mousedownPoint: PointInfo | undefined
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
    const pointInfo = this.getPointInfo(ev)
    const shape = this.getShape(ev)
    const method = (this as StringKeyObject)[`on${type}`]
    let leaveCanvas = false
    if (method) {
      method.call(this, shape, ev, pointInfo)
    } else {
      // 如果进入、移出画布时存在图形，需要作出处理
    }
    if (!leaveCanvas) {
      this.currentShape = shape
    }
  }

  // 记录下点击的位置、图形，便于拖拽事件、click 事件的判定
  onmousedown(shape: IShape, ev: MouseEvent, pointInfo: PointInfo) {
    // 只有鼠标左键的 mousedown 事件才会设置 mousedownShape 等属性，避免鼠标右键的 mousedown 事件引起其他事件发生
    if (ev.button === LEFT_BTN_CODE) {
      this.mousedownShape = shape
      this.mousedownPoint = pointInfo
      this.mousedownTimeStamp = ev.timeStamp
    }
    this.emitEvent('mousedown', ev, shape)
  }

  // 大量的图形事件，都通过 mousemove 模拟
  onmousemove(shape: IShape, event: MouseEvent, pointInfo: PointInfo) {
    const canvas = this.canvas as ICanvas
    const preShape = this.currentShape as IShape
    let draggingShape = this.draggingShape
    // 正在拖拽时
    if (this.dragging) {
      // 正在拖拽中
      if (draggingShape) {
        // 如果拖拽了 shape 会触发 dragenter, dragleave, dragover 和 drag 事件
        this.emitDragoverEvents(event, preShape, shape, false)
      }
      // 如果存在 draggingShape 则会在 draggingShape 上触发 drag 事件，冒泡到 canvas 上
      // 否则在 canvas 上触发 drag 事件
      this.emitEvent('drag', event, draggingShape)
    } else {
      const mousedownPoint = this.mousedownPoint
      if (mousedownPoint) {
        // 当鼠标点击下去，同时移动时，进行 drag 判定
        const mousedownShape = this.mousedownShape
        const now = event.timeStamp
        const timeWindow = now - (this.mousedownTimeStamp as number)
        const dx = mousedownPoint.clientX - pointInfo.clientX
        const dy = mousedownPoint.clientY - pointInfo.clientY
        const dist = dx * dx + dy * dy
        if (timeWindow > 120 || dist > CLICK_OFFSET) {
          if (mousedownShape && mousedownShape.get('draggable')) {
            // 设置了 draggable 的 shape 才能触发 drag 相关的事件
            draggingShape = this.mousedownShape as IShape // 拖动鼠标点下时的 shape
            draggingShape.set('capture', false) // 禁止继续拾取，否则无法进行 dragover,dragenter,dragleave,drop的判定
            this.draggingShape = draggingShape
            this.dragging = true
            this.emitEvent('dragstart', event, draggingShape)
            // 清理按下鼠标时缓存的值
            this.mousedownShape = undefined
            this.mousedownPoint = undefined
          } else if (!mousedownShape && canvas.get('draggable')) {
            // 设置了 draggable 的 canvas 才能触发 drag 相关的事件
            this.dragging = true
            this.emitEvent('dragstart', event)
            // 清理按下鼠标时缓存的值
            this.mousedownShape = undefined
            this.mousedownPoint = undefined
          } else {
            this.emitMouseoverEvents(event, preShape, shape)
            this.emitEvent('mousemove', event, shape)
          }
        } else {
          this.emitMouseoverEvents(event, preShape, shape)
          this.emitEvent('mousemove', event, shape)
        }
      } else {
        // 没有按键按下时，则直接触发 mouse over 相关的各种事件
        this.emitMouseoverEvents(event, preShape, shape)
        // 始终触发移动
        this.emitEvent('mousemove', event, shape)
      }
    }
  }

  // 按键抬起时，会终止拖拽、触发点击
  onmouseup(shape: IShape, ev: MouseEvent) {
    if (ev.button === LEFT_BTN_CODE) {
      const draggingShape = this.draggingShape
      if (this.dragging) {
        // 存在可以拖拽的图形，同时拖拽到其他图形上时触发 drag 事件
        if (draggingShape) {
          this.emitEvent('drop', ev, shape)
        }
        this.emitEvent('dragend', ev, draggingShape)
        this.afterDrag(draggingShape, ev)
      } else {
        this.emitEvent('mouseup', ev, shape) // 先触发 mouseup 再触发 click
        if (shape === this.mousedownShape) {
          this.emitEvent('click', ev, shape)
        }
        this.mousedownShape = undefined
        this.mousedownPoint = undefined
      }
    }
  }

  // dragover 不等同于 mouseover，而等同于 mousemove
  emitDragoverEvents(event: MouseEvent, fromShape: IShape | undefined, toShape: IShape, isCanvasEmit: boolean) {
    console.log('暂未实现')
  }

  // mouseleave 和 mouseenter 都是成对存在的
  // mouseenter 和 mouseover 同时触发
  emitMouseoverEvents(event: MouseEvent, fromShape: IShape, toShape: IShape) {
    console.log('暂未实现')
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

  getEventObj(type: string, event: Event, target?: IShape) {
    const eventObj = new GraphEvent(type, event)
    if (target) {
      eventObj.propagationPath.push(target)
    }
    return eventObj
  }

  // 获取事件的当前点的信息
  getPointInfo(ev: Event) {
    const canvas = this.canvas as ICanvas
    const clientPoint = canvas.getClientByEvent(ev)
    const point = canvas.getPointByEvent(ev)
    return {
      x: point.x,
      y: point.y,
      clientX: clientPoint.x,
      clientY: clientPoint.y
    }
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