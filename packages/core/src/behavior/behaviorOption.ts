import { LooseObject } from '@cc/base'
import { each } from '@cc/util'
import { IAbstractGraph } from '../interface'
import { BehaviorOption, CCGEvent } from '../types'

// 自定义 Behavior 时候共有的方法
const behaviorOption: BehaviorOption = {
  getDefaultCfg() {
    return {}
  },
  
  getEvents() {
    return {}
  },

  bind(graph: IAbstractGraph) {
    const { events } = this
    this.graph = graph
    each(events as object | any[], (handler: () => void, event: CCGEvent) => {
      graph.on(event, handler)
    })
  },

  unbind(graph: IAbstractGraph) {
    const { events } = this
    each(events as object | any[], (handler: () => void, event: CCGEvent) => {
      graph.off(event, handler)
    })
  },

  get(val: string) {
    return (this as any)[val]
  },

  set(key: string, val: any) {
    (this as any)[key] = val
    return this
  }
}

export default behaviorOption