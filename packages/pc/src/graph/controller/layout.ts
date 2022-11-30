import { AbstractLayout, GraphData } from '@cc/core'
import { Layout } from '../../layout'
import { IGraph } from '../../interface/graph'

interface LayoutCfg {
  type?: string
  onLayoutEnd?: () => void
  nodesFilter?: any;
}


function addLayoutOrder(data: GraphData, order: number) {
  if (!data?.nodes?.length) {
    return
  }
  const { nodes } = data
  nodes.forEach(node => {
    node.layoutOrder = order
  })
}

export default class LayoutController extends AbstractLayout {
  public graph: IGraph
  private data: any
  constructor(graph: IGraph) {
    super(graph)
    this.graph = graph
    this.initLayout()
  }

  protected initLayout() {

  }

  public layout(success?: () => void): boolean {
    const { graph } = this

    this.data = this.setDataFromGraph()

    const { nodes } = this.data

    if (!nodes) {
      return false
    }

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

    graph.emit('beforelayout')

    const { onLayoutEnd } = layoutCfg

    layoutCfg.onAllLayoutEnd = async () => {
      // 执行用户自定义 onLayoutEnd
      if (onLayoutEnd) {
        onLayoutEnd(nodes)
      }

      // 更新节点位置
      this.refreshLayout()

      graph.emit('afterlayout')
    }

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
    return new Promise(async (reslove, reject) => {
      const { graph } = this
      if (!graph || graph.get('destroyed')) {
        return
      }
      const layoutType = layoutCfg.type as string

      // 每个布局方法都需要注册
      layoutCfg.onLayoutEnd = () => {
        graph.emit('aftersublayout', { type: layoutType })
        reslove()
      }

      let layoutMethod

      try {
        layoutMethod = new Layout[layoutType](layoutCfg)
        if (this.layoutMethods[order]) {
          this.layoutMethods[order].destroy()
        }
        this.layoutMethods[order] = layoutMethod
      } catch (e) {
        console.warn(`The layout method: '${layoutType}' does not exist! Please specify it first.`)
        reject()
      }

      const layoutData = this.filterLayoutData(this.data, layoutCfg)
      addLayoutOrder(layoutData, order)
      layoutMethod.init(layoutData)

      graph.emit('beforesublayout', { type: layoutType })
      await layoutMethod.execute()
      if (layoutMethod.isCustomLayout && layoutCfg.onLayoutEnd) {
        layoutCfg.onLayoutEnd()
      }
    })
  }
}