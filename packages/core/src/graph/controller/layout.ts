
import { IAbstractGraph } from '../../interface/graph'

export default abstract class LayoutController {
  public graph: IAbstractGraph

  protected layoutCfg

  protected layoutType: string | string[] | null

  protected layoutMethods: any[]

  constructor(graph: IAbstractGraph) {
    this.graph = graph
    this.layoutCfg = graph.get('layout') || {}
    this.layoutType = this.getLayoutType()
    this.layoutMethods = []
    this.initLayout()
  }

  protected initLayout() {

  }

  public getLayoutType(): string | string[] | null {
    return this.getLayoutCfgType(this.layoutCfg)
  }

  protected getLayoutCfgType(layoutCfg: any): string | string[] | null {
    const type = layoutCfg.type

    if (type) {
      return type
    }

    const pipes = layoutCfg.pipes
    if (Array.isArray(pipes)) {
      return pipes.map((pipe) => pipe?.type || '')
    }

    return null
  }
}