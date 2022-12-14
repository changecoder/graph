import { EventEmitter, ICanvas, IGroup, LooseObject, Point } from '@cc/base'
import { clone, deepMix, each, isPlainObject, isString, transform } from '@cc/util'

import { IAbstractGraph } from '../interface/graph'
import { 
  ComboConfig,
  EdgeConfig,
  GraphData,
  GraphOptions,
  Item,
  ItemType,
  ModelConfig,
  NodeConfig,
  NodeMap,
  CCGEvent,
  ICCGGraphEvent
} from '../types'
import { ItemController, ModeController } from './controller'
import Global from '../global'
import { ICombo, IEdge, IItemBase, INode } from '../interface'
import { ITEM_TYPE } from '../constants'
import { singleDataValidation } from '../util/validation'
import { plainCombosToTrees } from '../util/graphic'

export interface PrivateGraphOption extends GraphOptions {
  data: GraphData

  nodes: NodeConfig[]

  edges: EdgeConfig[]

  vedges: EdgeConfig[]

  combos: ComboConfig[]

  itemMap: NodeMap

}

export default abstract class AbstractGraph extends EventEmitter implements IAbstractGraph {
  protected cfg: GraphOptions & LooseObject

  public destroyed: boolean

  constructor(cfg: GraphOptions) {
    super()
    this.cfg = deepMix(this.getDefaultCfg(), cfg)
    this.init()
    this.destroyed = false
  }

  protected init() {
    this.initCanvas()

    // instance controller
    const modeController = new ModeController(this)
    const itemController = new ItemController(this)

    this.set({
      modeController,
      itemController
    })

    // 初始化布局机制
    this.initLayoutController()

    // 初始化事件机制
    this.initEventController()

    this.initGroups()
  }

  protected abstract initLayoutController(): void

  protected abstract initEventController(): void

  protected abstract initCanvas(): void

  // 初始化所有 Group
  protected initGroups(): void {
    const canvas: ICanvas = this.get('canvas')
    if (!canvas) {
      return
    }
    const el: HTMLElement = canvas.get('el')
    const { id = 'graph' } = el || {}

    const group: IGroup = canvas.addGroup({
      id: `${id}-root`,
      className: Global.rootContainerClassName
    })

    if (this.get('groupByTypes')) {
      const edgeGroup: IGroup = group.addGroup({
        id: `${id}-edge`,
        className: Global.edgeContainerClassName
      })

      const nodeGroup: IGroup = group.addGroup({
        id: `${id}-node`,
        className: Global.nodeContainerClassName,
      })
      const comboGroup: IGroup = group.addGroup({
        id: `${id}-combo`,
        className: Global.comboContainerClassName,
      })

      this.set({ nodeGroup, edgeGroup, comboGroup })
    }
    const delegateGroup: IGroup = group.addGroup({
      id: `${id}-delegate`,
      className: Global.delegateContainerClassName,
    })
    this.set({ delegateGroup })
    this.set('group', group)
  }

  public getDefaultCfg(): Partial<PrivateGraphOption> {
    return {
      container: undefined,
      width: undefined,
      height: undefined,
      renderer: 'svg',
      modes: {},
      data: {},
      autoPaint: true,
      nodes: [],
      edges: [],
      combos: [],
      itemMap: {},
      linkCenter: false
    }
  }

  public set<T = any>(key: string | object, val?: T): AbstractGraph {
    if (isPlainObject(key)) {
      this.cfg = { ...this.cfg, ...key }
    } else {
      this.cfg[key] = val
    }
    return this
  }

  public get(key: string) {
    return this.cfg?.[key]
  }

  public getGroup(): IGroup {
    return this.get('group')
  }

  public findById(id: string): Item {
    return this.get('itemMap')[id]
  }

  public autoPaint(): void {
    if (this.get('autoPaint')) {
      this.paint()
    }
  }

  public paint(): void {
    this.emit('beforepaint')
    this.get('canvas').draw()
    this.emit('afterpaint')
  }

  public showItem(item: Item | string, stack: boolean = true): void {
    const itemController: ItemController = this.get('itemController')
    itemController.changeItemVisibility(item, true)
  }

  public hideItem(item: Item | string, stack: boolean = true): void {
    const itemController: ItemController = this.get('itemController')
    itemController.changeItemVisibility(item, false)
  }

  private innerAddItem(
    type: ItemType,
    model: ModelConfig,
    itemController: ItemController
  ): Item | boolean {
    if (!singleDataValidation(type, model)) {
      return false
    }

    if (model.id && this.findById(model.id as string)) {
      console.warn(
        `This item exists already. Be sure the id %c${model.id}%c is unique.`,
        'font-size: 20px; color: red;',
        ''
      )
      return false
    }

    const item = itemController.addItem(type, model)

    return item || false
  }

  public addItem(
    type: ItemType,
    model: ModelConfig
  ): Item | boolean {
    const itemController: ItemController = this.get('itemController')
    const item = this.innerAddItem(type, model, itemController)

    if (item === false || item === true) {
      return item
    }

    this.autoPaint()

    return item
  }

  public addItems(
    items: { type: ItemType, model: ModelConfig }[] = []
  ) {
    const itemController: ItemController = this.get('itemController')

    const returnItems: (Item | boolean)[] = []

    // Edge需要在Node和Combo后添加
    returnItems.push(...items.filter(item => item.type !== ITEM_TYPE.EDGE).map(item => this.innerAddItem(item.type, item.model, itemController)))
    // 添加Edge
    returnItems.push(...items.filter(item => item.type === ITEM_TYPE.EDGE).map(item => this.innerAddItem(item.type, item.model, itemController)))

    this.autoPaint()

    return returnItems
  }

  public add(
    type: ItemType,
    model: ModelConfig
  ): Item | boolean {
    return this.addItem(type, model)
  }

  public data(data?: GraphData): void {
    this.set('data', data)
  }

  public render(): void {
    const data: GraphData = this.get('data')

    if (!data) {
      throw new Error('data must be defined first')
    }


    const { nodes = [], edges = [], combos = [] } = data

    this.clear(true)

    this.emit('beforerender')

    this.addItems(
      nodes.map(node => ({ type: 'node', model: node }))
    )

    // 将combo和node放入一个树结构对象中
    if (combos?.length !== 0) {
      const comboTrees = plainCombosToTrees((combos as ComboConfig[]), (nodes as NodeConfig[]))
      this.set('comboTrees', comboTrees)
      // add combos
      this.addCombos(combos)
    }

    this.addItems(
      edges.map(edge => ({ type: 'edge', model: edge }))
    )

    const success = () => {
      this.autoPaint()
      this.emit('afterrender')
    }

    // layout
    const layoutController = this.get('layoutController')
    if (layoutController) {
      layoutController.layout(success)
      if (this.destroyed) {
        return 
      }
    } else {
      success()
    }
  }

  protected addCombos(combos: ComboConfig[]) {
    const comboTrees = this.get('comboTrees')
    const itemController: ItemController = this.get('itemController')
    itemController.addCombos(comboTrees, combos)
  }

  /**
   * 当节点位置在外部发生改变时，刷新所有节点位置，重计算边
   */
  public refreshPositions() {
    this.emit('beforegraphrefreshposition')

    const nodes: INode[] = this.get('nodes')
    const updatedNodes: { [key: string]: boolean } = {}
    let model: NodeConfig

    const updateItems = (items: IItemBase[]) => {
      each(items, (item: INode) => {
        model = item.getModel() as NodeConfig
        const changed = item.updatePosition({ x: model.x!, y: model.y! })
        updatedNodes[model.id] = changed
      })
    }

    updateItems(nodes)

    const edges: IEdge[] = this.get('edges')



    each(edges, (edge: IEdge) => {
      const sourceModel = edge.getSource().getModel()
      const target = edge.getTarget()
      // 避免 target 是纯对象的情况下调用 getModel 方法
      // 拖动生成边的时候 target 会是纯对象
      if (!isPlainObject(target)) {
        const targetModel = (target as INode | ICombo).getModel()
        if (
          updatedNodes[sourceModel.id as string] ||
          updatedNodes[targetModel.id as string]
        ) {
          edge.refresh()
        }
      }
    })

    this.emit('aftergraphrefreshposition')
    this.autoPaint()
  }

  public updateItem(
    item: Item | string,
    cfg: Partial<NodeConfig> | EdgeConfig
  ): void {
    const itemController: ItemController = this.get('itemController')
    let currentItem: Item
    if (isString(item)) {
      currentItem = this.findById(item as string)
    } else {
      currentItem = item
    }
    itemController.updateItem(currentItem, cfg)
  }

  public getNodes(): INode[] {
    return this.get('nodes')
  }

  public getEdges(): IEdge[] {
    return this.get('edges')
  }

  public getCombos(): ICombo[] {
    return this.get('combos')
  }

  public setMode(mode: string): AbstractGraph {
    const modeController: ModeController = this.get('modeController')
    modeController.setMode(mode)
    return this
  }

  public clear(avoidEmit: boolean = false): AbstractGraph {
    this.get('canvas')?.clear()

    this.initGroups()

    // 清空画布时同时清除数据
    this.set({ itemMap: {}, nodes: [], edges: [], combos: [], comboTrees: [] })
    if (!avoidEmit) {
      this.emit('afterrender')
    }
    return this
  }

  public layout(): void {
    const layoutController = this.get('layoutController')
    const layoutCfg = this.get('layout')
    if (!layoutCfg || !layoutController) {
      return
    }
    if (layoutController.layoutMethods?.length) {
      layoutController.relayout(true)
    } else {
      layoutController.layout()
    }
  }

  public on<T = ICCGGraphEvent>(eventName: CCGEvent, callback: (e: T) => void, once?: boolean): this {
    return super.on(eventName, callback, once)
  }

  /**
   * 获取当前视口伸缩比例
   * @return {number} 比例
   */
  public getZoom(): number {
    const matrix = this.get('group').getMatrix()
    return matrix ? matrix[0] : 1
  }

  // 伸缩视口到一固定比例
  public zoomTo(toRatio: number, center?: Point): boolean {
    const ratio = toRatio / this.getZoom()
    return this.zoom(ratio, center)
  }

  public zoom(ratio: number, center?: Point): boolean {
    const group: IGroup = this.get('group')
    let matrix = clone(group.getMatrix()) as number[] || [1, 0, 0, 0, 1, 0, 0, 0, 1]
    const minZoom: number = this.get('minZoom')
    const maxZoom: number = this.get('maxZoom')
    const currentZoom = this.getZoom() || 1
    const targetZoom = currentZoom * ratio
    let finalRatio = ratio

    let failed = false
    if (minZoom && targetZoom < minZoom) {
      finalRatio = minZoom / currentZoom
      failed = true
    } else if (maxZoom && targetZoom > maxZoom) {
      finalRatio = maxZoom / currentZoom
      failed = true
    }

    if (center) {
      matrix = transform(matrix, [
        ['t', -center.x, -center.y],
        ['s', finalRatio, finalRatio],
        ['t', center.x, center.y]
      ])
    } else {
      matrix = transform(matrix, [['s', finalRatio, finalRatio]])
    }

    group.setMatrix(matrix)
    this.emit('viewportchange', { action: 'zoom', matrix })
    this.autoPaint()

    return !failed
  }

  public destroy() {
    this.clear()

    this.get('itemController')?.destroy()
    this.get('modeController')?.destroy()
    this.get('canvas')?.destroy()

    this.destroyed = true
  }
}