import { mix, isObject, each, isArray } from '@graph/util'

import Base from './base'
import { ICanvas, ICtor, IElement, IGroup } from '../interfaces'
import { ChangeType, ShapeAttrs, ShapeBase} from '../types'
import { removeFromArray } from '../util'

// 数组嵌套对象的场景不考虑
function _cloneArrayAttr(arr: any[]) {
  const result = []
  for (let i = 0; i < arr.length; i++) {
    if (isArray(arr[i])) {
      result.push([].concat(arr[i]))
    } else {
      result.push(arr[i])
    }
  }
  return result
}

export default abstract class Element extends Base implements IElement {
  /**
   * @protected
   * 图形属性
   * @type {ShapeAttrs}
   */
   attrs: ShapeAttrs = {}

   constructor(cfg: any) {
    super(cfg)
    const attrs = this.getDefaultAttrs()
    mix(attrs, cfg.attrs)
    this.attrs = attrs
    this.initAttrs(attrs)
  }
  
  getDefaultCfg(): {
    [key: string]: any
  } {
    return {
      visible: true,
      capture: true,
      zIndex: 0
    }
  }

  /**
   * 获取默认的属相
   */
  getDefaultAttrs() {
    return {
      matrix: this.getDefaultMatrix(),
      opacity: 1
    }
  }

  /**
   * 获取默认的矩阵
   */
   getDefaultMatrix(): number[] | null {
    return null
  }

  /**
   * 初始化属性，有些属性需要加工
   * @param {object} attrs 属性值
   */
  initAttrs(attrs: ShapeAttrs) {}

  isGroup() {
    return false
  }

  getParent(): IGroup {
    return this.get('parent')
  }

  getCanvas(): ICanvas {
    return this.get('canvas')
  }

  attr(...args: any[]) {
    const [ name, value] = args
    if (!name) {
      return this.attrs
    }
    if (isObject(name)) {
      for (const k in name) {
        this.setAttr(k, name[k])
      }
      this.afterAttrsChange()
      return this
    }
    if (args.length === 2) {
      this.setAttr(name, value)
      this.afterAttrsChange()
      return this
    }
    return this.attrs[name]
  }

  /**
   * 内部设置属性值的接口
   * @param {string} name 属性名
   * @param {any} value 属性值
   */
  setAttr(name: string, value: any) {
    const originValue = this.attrs[name]
    if (originValue !== value) {
      this.attrs[name] = value
    }
  }

  /**
   * 属性更改后需要做的事情
   * @protected
   */
  afterAttrsChange() {
    this.onCanvasChange('attr')
  }

  show() {
    // 不是高频操作直接使用 set
    this.set('visible', true)
    this.onCanvasChange('show')
    return this
  }

  hide() {
    // 不是高频操作直接使用 set
    this.set('visible', false)
    this.onCanvasChange('hide')
    return this
  }

  remove(destroy = true) {
    const parent = this.getParent()
    if (parent) {
      removeFromArray(parent.getChildren(), this)
      if (!parent.get('clearing')) {
        // 如果父元素正在清理，当前元素不触发 remove
        this.onCanvasChange('remove')
      }
    } else {
      this.onCanvasChange('remove')
    }
    if (destroy) {
      this.destroy()
    }
  }

  clone() {
    const originAttrs = this.attrs
    const attrs: {
      [key: string]: any
    } = {}
    each(originAttrs, (i: any, k: string | number) => {
      if (isArray(originAttrs[k])) {
        attrs[k] = _cloneArrayAttr(originAttrs[k])
      } else {
        attrs[k] = originAttrs[k]
      }
    })
    const cons = this.constructor
    // @ts-ignore
    const clone = new cons({ attrs })

    return clone
  }

  setZIndex(zIndex: number) {
    this.set('zIndex', zIndex)
    return this
  }

  abstract getShapeBase(): ShapeBase
  abstract getGroupBase(): ICtor<IGroup>

  /**
   * @protected
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {}
}