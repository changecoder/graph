
import { IAbstractGraph } from '../../interface/graph'
import { GraphData } from '../../types'

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

  // 从 this.graph 获取数据
  public setDataFromGraph(): GraphData {
    const nodeItems = this.graph.getNodes()
    const edgeItems = this.graph.getEdges()
    const comboItems = this.graph.getCombos()

    const nodes = nodeItems.filter(item => !item.destroy || item.isVisible()).map(item => item.getModel())
    const hiddenNodes = nodeItems.filter(item => !item.destroy || !item.isVisible()).map(item => item.getModel())
    const edges = edgeItems.filter(item => !item.destroy || item.isVisible()).map(item => item.getModel())
    const hiddenEdges= edgeItems.filter(item => !item.destroy || !item.isVisible()).map(item => item.getModel())
    const combos = comboItems.filter(item => !item.destroy || item.isVisible()).map(item => item.getModel())
    const hiddenCombos= comboItems.filter(item => !item.destroy || !item.isVisible()).map(item => item.getModel())

    return {
      nodes,
      hiddenNodes,
      edges,
      hiddenEdges,
      combos,
      hiddenCombos
    } as GraphData
  }
}