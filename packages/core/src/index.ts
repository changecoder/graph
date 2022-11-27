import AbstractGraph from './graph/graph'
import Global from './global'
import AbstractLayout from './graph/controller/layout'
import AbstractEvent from './graph/controller/event'
import Shape from './element'

import Node from './item/node'

const registerNode = Shape.registerNode

export * from './types'

export {
  Shape,
  Node,
  registerNode,
  AbstractGraph,
  AbstractLayout,
  AbstractEvent
}

export default {
  Shape,
  Node,
  version: Global.version,
  registerNode: Shape.registerNode,
}