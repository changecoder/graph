import { LooseObject, Point } from '@cc/base'
import { CCGEvent, ICCGGraphEvent, INode, IPoint, NodeConfig } from '@cc/core'
import { debounce } from '@cc/util'

interface IBehaviorEvent {
  targets: INode[],
  evt: ICCGGraphEvent,
  point: LooseObject,
  origin: IPoint
}

export default {
  targets: [] as INode[],

  point: {} as LooseObject,

  origin: {} as Point | null,

  enableDebounce: false,

  getDefaultCfg(): object {
    return {
      enableDebounce: false
    }
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
    const { item } = evt
    // 目前只支持拖动单个节点
    this.targets = [(item as INode)]
    this.origin = {
      x: evt.x,
      y: evt.y
    }
    this.point = {}
  },

  /**
   * 持续拖动节点
   * @param evt
   */
  onDrag(evt: ICCGGraphEvent) {
    if (this.enableDebounce) {
      this.debounceUpdate({
        targets: this.targets,
        point: this.point,
        origin: this.origin,
        evt,
      })
    } else {
      this.targets.map(target => {
        this.update(target, evt)
      })
    }
  },

  /**
   * 拖动结束，设置拖动元素capture为true，更新元素位置，如果是拖动涉及到 combo，则更新 combo 结构
   * @param evt
   */
  onDragEnd(evt: ICCGGraphEvent) {
    this.point = {}
    this.origin = null
    this.targets.length = 0
  },

  // 更新节点
  update(item: INode, evt: ICCGGraphEvent) {
    const { point, origin } = this
    const model: NodeConfig = item.get('model')
    const nodeId: string = item.get('id')
    if (!point[nodeId]) {
      point[nodeId] = {
        x: model.x || 0,
        y: model.y || 0
      }
    }

    const x: number = evt.x - origin.x + point[nodeId].x
    const y: number = evt.y - origin.y + point[nodeId].y

    const pos: Point = { x, y }
    item.updatePosition(pos)
  },

  // 限流更新节点, 在当前情况下限流效果不理想
  debounceUpdate: debounce(
    ( event: IBehaviorEvent ) => {
      const { targets, evt, point, origin } = event
      targets.forEach((item: INode) => {
        const model: NodeConfig = item.get('model')
        const nodeId: string = item.get('id')
        if (!point[nodeId]) {
          point[nodeId] = {
            x: model.x || 0,
            y: model.y || 0
          }
        }

        const x: number = evt.x - origin.x + point[nodeId].x
        const y: number = evt.y - origin.y + point[nodeId].y

        const pos: Point = { x, y }
        item.updatePosition(pos)
      })
    }, 50, true
  )
}