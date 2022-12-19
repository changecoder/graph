import { IShape } from '../interfaces'
import { LooseObject } from '../types'

export default class GraphEvent {
  // 事件类型
  type: string

  // 事件名称
  name: string

  // 画布上的位置 x
  x!: number

  // 画布上的位置 y
  y!: number

  // 是否允许冒泡
  bubbles: boolean = true

  /**
   * 是否阻止了原生事件
   * @type {boolean}
   */
  defaultPrevented: boolean = false

  /**
   * 触发时的对象
   * @type {object}
   */
  originalEvent: Event

  /**
   * 阻止浏览器默认的行为
   */
  preventDefault() {
    this.defaultPrevented = true
    if (this.originalEvent.preventDefault) {
      this.originalEvent.preventDefault()
    }
  }
  
  // 是否阻止传播（向上冒泡）
  propagationStopped: boolean = false

  // 触发对象
  target: LooseObject | null = null

  /**
   * 监听对象
   * @type {object}
   */
  currentTarget: LooseObject | null = null

  // 触发事件的图形
  shape: IShape | null = null

  // 触发时的时间
  timeStamp: number

  // 触发事件的路径
  propagationPath: any[] = []

  constructor(type: string, event: any) {
    this.type = type
    this.name = type
    this.originalEvent = event
    this.timeStamp = event.timeStamp
  }
}