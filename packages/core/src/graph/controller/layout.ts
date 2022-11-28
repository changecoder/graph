
import { isFunction } from '@graph/util'
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

  // 绘制
  public refreshLayout() {
    const { graph } = this
    if (!graph) {
      return
    }
    graph.refreshPositions()
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

  // 筛选参与布局的nodes
  protected filterLayoutData(data: GraphData, cfg: { nodesFilter?: any }) {
    const { nodes, ...rest } = data
    if (!nodes) {
      return data
    }

    let nodesFilter
    if (isFunction(cfg?.nodesFilter)) {
      nodesFilter = cfg.nodesFilter
    } else {
      nodesFilter = () => true
    }

    const fNodes = nodes.filter(nodesFilter)

    return {
      nodes: fNodes,
      ...rest
    }
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