import { CCGEvent, ICCGGraphEvent } from '@cc/core'

export default {
  getDefaultCfg(): object {
    return {}
  },
  getEvents(): { [key in CCGEvent]?: string } {
    return {
      'node:dragstart': 'onDragStart',
      'node:drag': 'onDrag',
      'node:dragend': 'onDragEnd'
    }
  },
  /**
   * 开始拖动节点
   * @param evt
   */
  onDragStart(evt: ICCGGraphEvent) {
    console.log(evt)
  },

  /**
   * 持续拖动节点
   * @param evt
   */
  onDrag(evt: ICCGGraphEvent) {
    console.log(evt)
  },

  /**
   * 拖动结束，设置拖动元素capture为true，更新元素位置，如果是拖动涉及到 combo，则更新 combo 结构
   * @param evt
   */
  onDragEnd(evt: ICCGGraphEvent) {
    console.log(evt)
  }
}