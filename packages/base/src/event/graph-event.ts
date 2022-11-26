import { IShape } from '../interfaces'
import { LooseObject } from '../types'

export default class GraphEvent {
  // 事件类型
  type: string

  // 事件名称
  name: string

  // 是否允许冒泡
  bubbles: boolean = true

  // 是否阻止传播（向上冒泡）
  propagationStopped: boolean = false

  // 触发对象
  target: LooseObject | null = null

  // 触发事件的图形
  shape: IShape | null = null

  // 触发时的时间
  timeStamp: number

  // 触发事件的路径
  propagationPath: any[] = []

  constructor(type: string, event: Event) {
    this.type = type
    this.name = type
    this.timeStamp = event.timeStamp
  }
}