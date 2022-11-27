import { AbstractLayout } from '@graph/core'

import { IGraph } from '../../interface/graph'

export default class LayoutController extends AbstractLayout {
  public graph: IGraph

  constructor(graph: IGraph) {
    super(graph)
    this.graph = graph
    this.initLayout()
  }

  protected initLayout() {

  }
}