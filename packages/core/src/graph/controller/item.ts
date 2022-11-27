import { isString } from '@graph/util'
import { IAbstractGraph } from '../../interface/graph'
import { ComboConfig, ComboTree, Item, ItemType, ModelConfig } from '../../types'

export default class ItemController {
  private graph: IAbstractGraph

  public destroyed: boolean

  constructor(graph: IAbstractGraph) {
    this.graph = graph
    this.destroyed = false
  }

  public addItem<T extends Item>(type: ItemType, model: ModelConfig) {
    console.warn('等待开发')
  }

  public addCombos(comboTrees: ComboTree[], comboModels: ComboConfig[]) {
    console.warn('等待开发')
  }

  // 改变Item的显示状态
  public changeItemVisibility(item: Item | string, visible: boolean): Item | undefined {
    const { graph } = this

    if (isString(item)) {
      item = graph.findById(item)
    }

    if (!item) {
      console.warn('The item to be shown or hidden does not exist!')
      return
    }

    return item
  }
}