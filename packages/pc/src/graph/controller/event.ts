import { AbstractEvent } from '@graph/core'

import Graph from '../graph'


export default class EventController extends AbstractEvent {
  public destroyed: boolean

  constructor(graph: Graph) {
    super(graph)
    this.destroyed = false
    this.initEvents()
  }

  protected initEvents() {
    
  }

  public destroy() {
    this.destroyed = true
  }
}
