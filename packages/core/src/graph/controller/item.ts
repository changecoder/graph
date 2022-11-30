import { IGroup } from '@cc/base'
import { deepMix, each, isArray, isObject, isString, upperFirst, clone } from '@cc/util'
import { CFG_PREFIX, ITEM_TYPE } from '../../constants'
import { IAbstractGraph } from '../../interface'
import { ComboConfig, ComboTree, Item, ItemType, ModelConfig } from '../../types'
import Node from '../../item/node'

export default class ItemController {
  private graph: IAbstractGraph

  public destroyed: boolean

  constructor(graph: IAbstractGraph) {
    this.graph = graph
    this.destroyed = false
  }

  public addItem<T extends Item>(type: ItemType, model: ModelConfig) {
    const { graph } = this
    const vType = type
    const parent: IGroup = graph.get(`${vType}Group`) || graph.get('group')
    const upperType = upperFirst(vType)

    let item: Item | null = null

    const defaultModel = graph.get(CFG_PREFIX + upperType)

    if (defaultModel) {
      // 很多布局会直接修改原数据模型，所以不能用 merge 的形式，逐个写入原 model 中
      each(defaultModel, (val, cfg) => {
        if (isObject(val) && !isArray(val)) {
          model[cfg] = deepMix({}, val, model[cfg])
        } else if (isArray(val)) {
          model[cfg] = model[cfg] || clone(defaultModel[cfg])
        } else {
          model[cfg] = model[cfg] || defaultModel[cfg]
        }
      })
    }

    graph.emit('beforeadditem', { type, model })

    if (type === ITEM_TYPE.NODE) {
      item = new Node({
        model,
        group: parent.addGroup()
      })
    }

    if (item) {
      graph.get(`${type}s`).push(item)
      graph.get('itemMap')[item.get('id')] = item
      graph.emit('afteradditem', { item, model })
      return item as T
    }
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