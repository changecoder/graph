import { Node, Model } from '../types'

export class Base {
  public nodes: Node[] | null = []
  public hiddenNodes: Node[] | null = []
  public destroyed: boolean = false
  public onLayoutEnd: () => void = () => { }

  public layout(data: Model): Model {
    this.init(data)
    return this.execute(true)
  }

  public init(data: Model) {
    this.nodes = data.nodes || []
    this.hiddenNodes = data.hiddenNodes || []
  }

  public execute(reloadData?: boolean): any {}
  public executeWithWorker() {}

  public getDefaultCfg() {
    return {}
  }

  public updateCfg(cfg: any) {
    if (cfg) {
      Object.assign(this, cfg)
    }
  }

  public getType() {
    return 'base'
  }

  public destroy() {
    this.nodes = null
    this.destroyed = true
  }
}
