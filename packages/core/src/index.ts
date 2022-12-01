import AbstractGraph from './graph/graph'
import Global from './global'
import AbstractLayout from './graph/controller/layout'
import AbstractEvent from './graph/controller/event'
import Shape from './element'
import Behavior from './behavior'

import Node from './item/node'
import { IBehavior } from './interface'

const registerNode = Shape.registerNode
const registerBehavior = (Behavior as IBehavior).registerBehavior

export * from './types'
export * from './interface'

export {
  Shape,
  Node,
  registerNode,
  registerBehavior,
  AbstractGraph,
  AbstractLayout,
  AbstractEvent
}

export default {
  Shape,
  Node,
  version: Global.version,
  registerNode: Shape.registerNode,
  registerBehavior: (Behavior as IBehavior).registerBehavior
}