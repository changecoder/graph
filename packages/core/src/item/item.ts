import { IGroup } from '@cc/base'
import { isPlainObject, uniqueId, clone } from '@cc/util'

import { IItemBase, IItemBaseConfig } from '../interface'
import { ComboConfig, EdgeConfig, IBBox, IShapeBase, ItemType, ModelConfig, NodeConfig, UpdateType } from '../types'
import Shape from '../element/shape'
import { CACHE_BBOX } from '../constants'
import { getBBox } from '../util/graphic'

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

  /**
   * 根据 keyshape 计算包围盒
   */
  private calculateBBox(): IBBox {
    const keyShape: IShapeBase = this.get('keyShape')
    const group: IGroup = this.get('group')
    // 因为 group 可能会移动，所以必须通过父元素计算才能计算出正确的包围盒
    const bbox = getBBox(keyShape, group)
    bbox.x = bbox.minX
    bbox.y = bbox.minY
    bbox.width = bbox.maxX - bbox.minX
    bbox.height = bbox.maxY - bbox.minY
    bbox.centerX = (bbox.minX + bbox.maxX) / 2
    bbox.centerY = (bbox.minY + bbox.maxY) / 2
    return bbox
  }
    
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
    const cfg = this.getShapeCfg(model) as ModelConfig // 可能会附加额外信息
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

  public getShapeCfg(model: ModelConfig, updateType?: UpdateType): ModelConfig {
    const styles = this.get('styles')
    if (styles) {
      // merge graph的item样式与数据模型中的样式
      const newModel = model
      newModel.style = { ...styles, ...(model.style || {}) }
      return newModel
    }
    return model
  }

  public getBBox(): IBBox {
    // 计算 bbox 开销有些大，缓存
    let bbox: IBBox = this.get(CACHE_BBOX)
    if (!bbox) {
      bbox = this.calculateBBox()
      this.set(CACHE_BBOX, bbox)
    }
    return bbox
  }
  
  public refresh(updateType?: UpdateType) {
    const model: ModelConfig = this.get('model')
    // 更新元素位置
    this.updatePosition(model)
    // 更新元素内容，样式
    this.updateShape(updateType)
    // 清除缓存
    this.clearCache()
  }

  public getUpdateType(cfg?: ModelConfig): UpdateType {
    return undefined
  }

  // 将更新应用到 model 上，刷新属性
  public update(cfg: ModelConfig, updateType: UpdateType = undefined) {
    const model: ModelConfig = this.get('model')
    // 仅仅移动位置时，既不更新，也不重绘
    if (updateType === 'move') {
      this.updatePosition(cfg)
    }
  }

  /**
   * 更新元素内容，样式
   */
  public updateShape(updateType?: UpdateType) {
    const shapeFactory = this.get('shapeFactory')
    const model = this.get('model')
    const shape = model.type
    // 判定是否允许更新
    // 1. 注册的节点允许更新（即有继承的/复写的 update 方法，即 update 方法没有被复写为 undefined）
    // 2. 更新后的 shape 等于原先的 shape
    if (shapeFactory.shouldUpdate(shape) && shape === this.get('currentShape')) {
      const updateCfg = this.getShapeCfg(model, updateType)
      shapeFactory.baseUpdate(shape, updateCfg, this, updateType)
    } else {
      // 如果不满足上面两种状态，重新绘制
      this.draw()
    }
  }

  /**
   * 更新位置，避免整体重绘
   * @param {object} cfg 待更新数据
   */
  public updatePosition(cfg: ModelConfig): boolean {
    const model: ModelConfig = this.getModel()

    const x = cfg.x === undefined ? model.x : cfg.x
    const y = cfg.y === undefined ? model.y : cfg.y

    const group: IGroup = this.get('group')


    if (x === undefined || y === undefined) {
      return false
    }
    model.x = x
    model.y = y

    const matrix = group.getMatrix()

    if (matrix && matrix[6] === x && matrix[7] === y) {
      return false
    }

    group.translate(x, y)
    this.clearCache() // 位置更新后需要清除缓存
    return true
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

  /**
   * 更新/刷新等操作后，清除 cache
   */
  protected clearCache() {
    this.set(CACHE_BBOX, null)
  }

  public destroy() {
    if (!this.destroyed) {
      this.destroyed = true
    }
  }
}