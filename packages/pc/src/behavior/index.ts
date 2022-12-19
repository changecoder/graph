import { registerBehavior } from '@cc/core'
import { each } from '@cc/util'

import DragNode from './drag-node'
import ZoomCanvas from './zoom-canvas'

const behaviors = {
  'zoom-canvas': ZoomCanvas,
  'drag-node': DragNode
}

each(behaviors, (behavior, type: string) => {
  registerBehavior(type, behavior)
})