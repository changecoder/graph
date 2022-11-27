import { EventEmitter, ICanvas, IGroup } from '@graph/base'
import { deepMix, isPlainObject } from '@graph/util'

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
  GEvent,
  IGGraphEvent
} from '../types'
import { ItemController, ModeController } from './controller'
import Global from '../global'
import { ICombo, IEdge, INode } from '../interface'

export interface PrivateGraphOption extends GraphOptions {
  data: GraphData

  nodes: NodeConfig[]

  edges: EdgeConfig[]

  vedges: EdgeConfig[]

  combos: ComboConfig[]

  itemMap: NodeMap

}

export default abstract class AbstractGraph extends EventEmitter implements IAbstractGraph {
  protected cfg: GraphOptions & { [key: string]: any }

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
    console.warn('等待开发')
    return false
  }

  public addItem(
    type: ItemType,
    model: ModelConfig
  ): Item | boolean {
    console.warn('等待开发')
    return false
  }

  public addItems(
    items: { type: ItemType, model: ModelConfig }[] = []
  ) {
    const returnItems: (Item | boolean)[] = []

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

  }

  protected addCombos(combos: ComboConfig[]) {
    const comboTrees = this.get('comboTrees')
    const itemController: ItemController = this.get('itemController')
    itemController.addCombos(comboTrees, combos)
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

  public on<T = IGGraphEvent>(eventName: GEvent, callback: (e: T) => void, once?: boolean): this {
    return super.on(eventName, callback, once)
  }

  public destroy() {
    this.clear()

    this.get('itemController')?.destroy()
    this.get('modeController')?.destroy()
    this.get('canvas')?.destroy()

    this.destroyed = true
  }
}