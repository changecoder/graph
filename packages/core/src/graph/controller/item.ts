import { IGroup } from '@cc/base'
import { 
  deepMix, 
  each, 
  isArray, 
  isObject, 
  isString, 
  upperFirst, 
  clone, 
  throttle,
  traverseTreeUp
} from '@cc/util'
import { CFG_PREFIX, ITEM_TYPE, MAPPER_SUFFIX } from '../../constants'
import { IAbstractGraph, ICombo, IEdge, INode } from '../../interface'
import { ComboConfig, ComboTree, EdgeConfig, Id, Item, ItemType, ModelConfig, NodeConfig, UpdateType } from '../../types'
import Node from '../../item/node'
import Edge from '../../item/edge'
import Combo from '../../item/combo'

export default class ItemController {
  private graph: IAbstractGraph

  public destroyed: boolean

  private edgeToBeUpdateMap: {
    [key: string]: {
      edge: IEdge,
      updateType: UpdateType
    }
  } = {}

  /**
   * 更新边限流，同时可以防止相同的边频繁重复更新
   * */
  private throttleRefresh = throttle(
    () => {
      const { graph } = this
      if (!graph || graph.get('destroyed')) {
        return
      }
      const edgeToBeUpdateMap = this.edgeToBeUpdateMap
      if (!edgeToBeUpdateMap) {
        return
      }
      const edgeValues = Object.values(edgeToBeUpdateMap)
      if (!edgeValues.length) {
        return
      }
      edgeValues.forEach(obj => {
        const edge = obj.edge
        if (!edge || edge.destroyed) {return}
        const source = edge.getSource()
        const target = edge.getTarget()
        if (!source || source.destroyed || !target || target.destroyed) {
          return
        }
        edge.refresh(obj.updateType)
      })
      this.edgeToBeUpdateMap = {}
    },
    16,
    {
      trailing: true,
      leading: true,
    }
  )

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
      each(defaultModel, (val: any, cfg: string | number) => {
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

    if (type === ITEM_TYPE.EDGE) {
      let source: Id
      let target: Id
      source = (model as EdgeConfig).source
      target = (model as EdgeConfig).target

      if (source && isString(source)) {
        source = graph.findById(source)
      }
      if (target && isString(target)) {
        target = graph.findById(target)
      }

      if (!source || !target) {
        console.warn(`The source or target node of edge ${model.id} does not exist!`)
        return
      }

      item = new Edge({
        model,
        source,
        target,
        linkCenter: graph.get('linkCenter'),
        group: parent.addGroup()
      })
    } else if (type === ITEM_TYPE.NODE) {
      item = new Node({
        model,
        group: parent.addGroup()
      })
    } else if (type === ITEM_TYPE.COMBO) {
      const children = (model as ComboConfig).children as ComboTree[]
      item = new Combo({
        model,
        group: parent.addGroup()
      })
      const comboModel = item.getModel();

      (children || []).forEach((child) => {
        const childItem = graph.findById(child.id) as ICombo | INode
        (item as ICombo).addChild(childItem)
        child.depth = (comboModel.depth as number) + 2
      })
    }

    if (item) {
      graph.get(`${type}s`).push(item)
      graph.get('itemMap')[item.get('id')] = item
      graph.emit('afteradditem', { item, model })
      return item as T
    }
  }

  // 更新节点和边
  public updateItem(
    item: Item | string,
    cfg: EdgeConfig | Partial<NodeConfig>
  ) {
    const { graph } = this

    if (isString(item)) {
      item = graph.findById(item) as Item
    }

    if (!item || item.destroyed) {
      return
    }

    // 更新的 item 的类型
    let type = ''
    if (item.getType) {
      type = item.getType()
    }

    const mapper = graph.get(type + MAPPER_SUFFIX)
    const model = item.getModel()

    const updateType = item.getUpdateType(cfg)

    if (mapper) {
      console.log('等待开发')
    } else {
      each(cfg, (val, key) => {
        if (model[key]) {
          if (isObject(val) && !isArray(val)) {
            cfg[key] = { ...(model[key] as Object), ...(cfg[key] as Object) }
          }
        }
      })
    }

    graph.emit('beforeupdateitem', { item, cfg })

    if (type === ITEM_TYPE.EDGE) {
      // 若是边要更新source || target, 为了不影响示例内部model，并且重新计算startPoint和endPoint，手动设置
      if (cfg.source) {
        let source: INode = cfg.source as INode
        if (isString(source)) {
          source = graph.findById(source) as INode
        }
        (item as IEdge).setSource(source)
      }
      if (cfg.target) {
        let target: INode = cfg.target as INode
        if (isString(target)) {
          target = graph.findById(target) as INode
        }
        (item as IEdge).setTarget(target)
      }
      item.update(cfg)
    } else if (type === ITEM_TYPE.NODE) {
      item.update(cfg, updateType)
      const edges: IEdge[] = (item as INode).getEdges()
      if (updateType === 'move') {
        each(edges, (edge: IEdge) => {
          this.edgeToBeUpdateMap[edge.getID()] = {
            edge: edge,
            updateType
          }
          this.throttleRefresh()
        })
      }
    }
  }

  // 根据 graph 上用 combos 数据生成的 comboTree 来增加所有 combos
  public addCombos(comboTrees: ComboTree[], comboModels: ComboConfig[]) {
    (comboTrees || []).forEach((ctree: ComboTree) => {
      traverseTreeUp<ComboTree>(ctree, (child: ComboTree) => {
        let comboModel
        comboModels.forEach((model) => {
          if (model.id === child.id) {
            model.children = child.children
            model.depth = child.depth
            comboModel = model
          }
        })
        if (comboModel) {
          this.addItem('combo', comboModel)
        }
        return true
      })
    })
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