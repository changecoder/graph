import { each, isString } from '@cc/util'
import Behavior from '../../behavior'
import { IAbstractGraph, IBehaviorOption } from '../../interface'
import { Modes } from '../../types'

export default class ModeController {
  private graph: IAbstractGraph

  public destroyed: boolean

  public modes: Modes

  public mode: string

  private currentBehaves: IBehaviorOption[]
  
  constructor(graph: IAbstractGraph) {
    this.graph = graph
    this.destroyed = false
    this.modes = graph.get('modes') || {
      default: []
    }
    this.formatModes()
    this.mode = graph.get('defaultMode') || 'default'
    this.currentBehaves = []
    this.setMode(this.mode)
  }

  private formatModes() {
    const { modes } = this
    each(modes, mode => {
      each(mode, (behavior, i) => {
        if (isString(behavior)) {
          mode[i] = { type: behavior }
        }
      })
    })
  }

  public setMode(mode: string) {
    const { modes, graph } = this
    const current = mode
    const behaviors = modes[current]
    if (!behaviors) {
      return
    }
    graph.emit('beforemodechange', { mode })

    each(this.currentBehaves, behave => {
      behave.unbind(graph)
    })
  
    this.setBehaviors(current)

    graph.emit('aftermodechange', { mode })

    this.mode = mode
  }

  private setBehaviors(mode: string) {
    const { graph } = this
    const behaviors = this.modes[mode]
    const behaves: IBehaviorOption[] = []
    let behave: IBehaviorOption
    each(behaviors || [], behavior => {
      const BehaviorInstance = Behavior.getBehavior(behavior.type || behavior)
      if (!BehaviorInstance) {
        return
      }
      behave = new BehaviorInstance(behavior)
      if (behave && behave.bind) {
        behave.bind(graph as IAbstractGraph)
        behaves.push(behave)
      }
    })
    this.currentBehaves = behaves
  }

  public destroy() {
    this.destroyed = true
  }
}