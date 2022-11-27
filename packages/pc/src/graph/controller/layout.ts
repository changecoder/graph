import { AbstractLayout } from '@graph/core'

import { IGraph } from '../../interface/graph'

interface LayoutCfg {
  type?: string
}

export default class LayoutController extends AbstractLayout {
  public graph: IGraph
  
  constructor(graph: IGraph) {
    super(graph)
    this.graph = graph
    this.initLayout()
  }

  protected initLayout() {

  }

  public layout(success?: () => void): boolean {
    const { graph } = this

    const width = graph.get('width')
    const height = graph.get('height')
    const layoutCfg: any = {}
    Object.assign(
      layoutCfg,
      {
        width,
        height,
        center: [width / 2, height / 2]
      },
      this.layoutCfg
    )
    this.layoutCfg = layoutCfg
    let layoutType = layoutCfg.type

    graph.emit('beforelayout')

    let start = Promise.resolve()
    let hasLayout = false
    if (layoutCfg.type) {
      hasLayout = true
      start = start.then(async () => await this.execLayoutMethod(layoutCfg, 0))
    } else if (layoutCfg.pipes) {
      hasLayout = true
      layoutCfg.pipes.forEach((cfg: LayoutCfg, index: number) => {
        start = start.then(async () => await this.execLayoutMethod(cfg, index))
      })
    }

    if (hasLayout) {
      start.then(() => {
        if (layoutCfg.onAllLayoutEnd) {
          layoutCfg.onAllLayoutEnd()
        }
        if (success) {
          success()
        }
      }).catch((error) => {
        console.warn('graph layout failed,', error)
      })
    } else {
      success?.()
    }

    return false
  }

  protected execLayoutMethod(layoutCfg: LayoutCfg, order: number): Promise<void> {
    return new Promise((reslove, reject) => {
      console.warn('等待实现')
      reslove()
    })
  }
}