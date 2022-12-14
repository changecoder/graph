import { CACHE_ANCHOR_POINTS, CACHE_BBOX } from '../constants'
import { ICombo, INode } from '../interface'
import Node from './node'

export default class Combo extends Node implements ICombo {
  public getDefaultCfg() {
    return {
      type: 'combo',
      nodes: [],
      edges: [],
      combos: []
    }
  }

  /**
   * 获取 Combo 中所有的子元素，包括 Combo、Node 及 Edge
   */
  public getChildren(): { nodes: INode[]; combos: ICombo[] } {
    const self = this
    return {
      nodes: self.getNodes(),
      combos: self.getCombos()
    }
  }


  // 向 Combo 中增加子 combo 或 node
  addChild(item: ICombo | INode): boolean {
    const itemType = item.getType()
    switch (itemType) {
    case 'node':
      this.addNode(item)
      break
    case 'combo':
      this.addCombo(item as ICombo)
      break
    default:
      console.warn('Only node or combo items are allowed to be added into a combo')
      return false
    }
    return true
  }

  addCombo(combo: ICombo): boolean {
    this.get('combos').push(combo)
    return true
  }

  addNode(node: string | INode): boolean {
    this.get('nodes').push(node)
    return true
  }

  /**
   * 获取 Combo 中所有子节点
   */
  getNodes(): INode[] {
    const self = this
    return self.get('nodes')
  }
  
  /**
    * 获取 Combo 中所有子 combo
    */
  getCombos(): ICombo[] {
    return this.get('combos')
  }
  
  public clearCache() {
    this.set(CACHE_BBOX, null) // 清理缓存的 bbox
    this.set(CACHE_ANCHOR_POINTS, null)
  }

  public destroy() {
    if (!this.destroyed) {
      this.clearCache()
      this.destroyed = true
    }
  }
}