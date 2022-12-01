import { registerBehavior } from '@cc/core'
import { each } from '@cc/util'

import DragNode from './drag-node'

const behaviors = {
  'drag-node': DragNode
}

each(behaviors, (behavior, type: string) => {
  registerBehavior(type, behavior)
})