import { IAbstractGraph } from '../../interface'
import { Modes } from '../../types'

export default class ModeController {
  private graph: IAbstractGraph

  public destroyed: boolean

  public modes: Modes

  public mode: string

  constructor(graph: IAbstractGraph) {
    this.graph = graph
    this.destroyed = false
    this.modes = graph.get('modes') || {
      default: []
    }

    this.mode = graph.get('defaultMode') || 'default'
  }

  public setMode(mode: string) {
    const { modes, graph } = this

    graph.emit('beforemodechange', { mode })

    graph.emit('aftermodechange', { mode })

    this.mode = mode
  }

  public destroy() {
    this.destroyed = true
  }
}