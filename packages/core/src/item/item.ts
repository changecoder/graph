import { IGroup } from '@graph/base'
import { isPlainObject, uniqueId, clone } from '@graph/util'
import { IItemBase, IItemBaseConfig } from '../interface'
import { ComboConfig, EdgeConfig, IShapeBase, ItemType, ModelConfig, NodeConfig } from '../types'
import Shape from '../element/shape'

export default class ItemBase implements IItemBase {
  public _cfg: IItemBaseConfig & {
    [key: string]: unknown
  } = {}

  public destroyed: boolean = false

  constructor(cfg: IItemBaseConfig) {
    const defaultCfg: IItemBaseConfig = {
      id: undefined,
      type: 'item',
      model: {} as ModelConfig,
      group: undefined,
      visible: true,
      keyShape: undefined
    }
    this._cfg = { ...defaultCfg, ...this.getDefaultCfg(), ...cfg }

    const model = this.get('model')
    let { id } = model

    const itemType = this.get('type')

    if (typeof id === 'undefined') {
      id = uniqueId(itemType)
    } else if (typeof id !== 'string') {
      id = String(id)
    }

    this.get('model').id = id
    this.set('id', id)
    const { group } = cfg
    if (group) {
      group.set('item', this)
      group.set('id', id)
    }

    this.init()
    this.draw()
  }

  protected init() {
    const shapeFactory = Shape.getFactory(this.get('type'))
    this.set('shapeFactory', shapeFactory)
  }

  public get<T = any>(key: string): T {
    return this._cfg[key] as T
  }

  public set(key: string | object, val?: unknown): void {
    if (isPlainObject(key)) {
      this._cfg = { ...this._cfg, ...key }
    } else {
      this._cfg[key] = val
    }
  }

  protected getDefaultCfg() {
    return {}
  }

  // 渲染前的逻辑，提供给子类复写
  protected beforeDraw() { }


  // 渲染后的逻辑，提供给子类复写
  protected afterDraw() { }

  public draw() {
    this.beforeDraw()
    this.drawInner()
    this.afterDraw()
  }

  private drawInner() {
    const shapeFactory = this.get('shapeFactory')
    const group: IGroup = this.get('group')
    const model: ModelConfig = this.get('model')
    group.clear()
    const visible = model.visible
    if (visible !== undefined && !visible) {
      this.changeVisibility(visible)
    }
    if (!shapeFactory) {
      return
    }
    this.updatePosition(model)
    const cfg = clone(model) as ModelConfig // 可能会附加额外信息
    const shapeType = cfg.type as string

    const keyShape: IShapeBase = shapeFactory.draw(shapeType, cfg, group)

    if (keyShape) {
      this.set('keyShape', keyShape)
      keyShape.set('isKeyShape', true)
      keyShape.set('draggable', true)
    }

    // 防止由于用户外部修改 model 中的 shape 导致 shape 不更新
    this.set('currentShape', shapeType)
  }

  public getContainer(): IGroup {
    return this.get('group')
  }

  public getKeyShape(): IShapeBase {
    return this.get('keyShape')
  }

  public getModel(): NodeConfig | EdgeConfig | ComboConfig {
    return this.get('model')
  }

  public getType(): ItemType {
    return this.get('type')
  }

  public getID(): string {
    return this.get('id')
  }

  /**
   * 更新位置，避免整体重绘
   * @param {object} cfg 待更新数据
   */
  public updatePosition(cfg: ModelConfig): boolean {
    console.warn('即将实现')
    return false
  }

  /**
   * 显示元素
   */
  public show() {
    this.changeVisibility(true)
  }

  /**
   * 隐藏元素
   */
  public hide() {
    this.changeVisibility(false)
  }

  /**
   * 更改是否显示
   * @param  {Boolean} visible 是否显示
   */
  public changeVisibility(visible: boolean) {
    const group: IGroup = this.get('group')
    if (visible) {
      group.show()
    } else {
      group.hide()
    }
    this.set('visible', visible)
  }

  /**
   * 元素是否可见
   * @return {Boolean} 返回该元素是否可见
   */
  public isVisible(): boolean {
    return this.get('visible')
  }

  public destroy() {
    if (!this.destroyed) {
      this.destroyed = true
    }
  }
}