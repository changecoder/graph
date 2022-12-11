import {
  Arrow
} from '@cc/core'

import Graph from './graph/graph'
import Global from './global'

import './behavior'

export * from './interface/graph'

export {
  Arrow,
  Graph
}

export default {
  version: Global.version,
  Graph,
  Arrow
}