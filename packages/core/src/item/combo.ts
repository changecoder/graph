import { isNumber } from '@cc/util'
import { CACHE_ANCHOR_POINTS, CACHE_BBOX, CACHE_SIZE } from '../constants'
import { ICombo, INode } from '../interface'
import { ModelConfig } from '../types'
import Node from './node'
import Global from '../global'

export default class Combo extends Node implements ICombo {
  public getDefaultCfg() {
    return {
      type: 'combo',
      nodes: [],
      edges: [],
      combos: []
    }
  }

  public getShapeCfg(model: ModelConfig): ModelConfig {
    const styles = this.get('styles')
    const bbox = this.get('bbox')
    if (styles && bbox) {
      // merge graph的item样式与数据模型中的样式
      const newModel = model
      const size = {
        r: Math.hypot(bbox.height, bbox.width) / 2 || Global.defaultCombo.size[0] / 2,
        width: bbox.width || Global.defaultCombo.size[0],
        height: bbox.height || Global.defaultCombo.size[1],
      }
      newModel.style = { ...styles, ...model.style, ...size }
      const padding = model.padding || Global.defaultCombo.padding
      if (isNumber(padding)) {
        size.r += padding as number
        size.width += (padding as number) * 2
        size.height += (padding as number) * 2
      } else {
        size.r += (padding as Array<number>)[0]
        size.width += ((padding as Array<number>)[1] + (padding as Array<number>)[3]) || (padding as Array<number>)[1] * 2
        size.height += ((padding as Array<number>)[0] + (padding as Array<number>)[2]) || (padding as Array<number>)[0] * 2
      }
      this.set(CACHE_SIZE, size)
      return newModel
    }
    return model
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

  removeCombo(combo: ICombo): boolean {
    if (!combo) {
      return false
    }
    const combos = this.getCombos()
    const index = combos.indexOf(combo)
    if (index > -1) {
      combos.splice(index, 1)
      return true
    }
    return false
  }

  removeNode(node: INode): boolean {
    if (!node) {
      return false
    }
    const nodes = this.getNodes()
    const index = nodes.indexOf(node)
    if (index > -1) {
      nodes.splice(index, 1)
      return true
    }
    return false
  }

  removeChild(item: ICombo | INode): boolean {
    const self = this
    const itemType = item.getType()
    switch (itemType) {
    case 'node':
      self.removeNode(item)
      break
    case 'combo':
      self.removeCombo(item as ICombo)
      break
    default:
      console.warn('Only node or combo items are allowed to be added into a combo')
      return false
    }
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