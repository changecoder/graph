
import { isObject, upperFirst, isFunction, each } from '@cc/util'
import { IContainer, IElement, IGroup, IShape } from '../interfaces'
import { ElementFilterFn } from '../types'
import { removeChild, setCanvas } from '../util'
import Element from './element'

const SHAPE_MAP: {
  [key: string]: any
} = {}

export default abstract class Container extends Element implements IContainer {
  isCanvas() {
    return false
  }

  getDefaultCfg() {
    const cfg = super.getDefaultCfg()
    cfg['children'] = []
    return cfg
  }

  addShape(...args: any[]): IShape {
    const type = args[0]
    let cfg = args[1]
    if (isObject(type)) {
      cfg = type
    } else {
      cfg['type'] = type
    }
    let shapeType = SHAPE_MAP[cfg.type]
    if (!shapeType) {
      shapeType = upperFirst(cfg.type)
      SHAPE_MAP[cfg.type] = shapeType
    }
    const ShapeBase = this.getShapeBase()
    const shape = new ShapeBase[shapeType](cfg)
    this.add(shape)
    return shape
  }

  addGroup(...args: any[]): IGroup {
    const [groupClass, cfg] = args
    let group
    if (isFunction(groupClass)) {
      if (cfg) {
        group = new groupClass(cfg)
      } else {
        group = new groupClass({
          parent: this
        })
      }
    } else {
      const tmpCfg = groupClass || {}
      const TmpGroupClass = this.getGroupBase()
      group = new TmpGroupClass(tmpCfg)
    }
    this.add(group)
    return group
  }

  getCanvas() {
    let canvas
    if (this.isCanvas()) {
      canvas = this
    } else {
      canvas = this.get('canvas')
    }
    return canvas
  }

  add(element: IElement) {
    const canvas = this.getCanvas()
    const children = this.getChildren()
    const preParent = element.getParent()
    if (preParent) {
      removeChild(preParent, element, false)
    }
    element.set('parent', this)
    if (canvas) {
      setCanvas(element, canvas)
    }
    children.push(element)
    element.onCanvasChange('add')
  }

  /**
   * 查找元素，找到第一个返回
   * @param  {ElementFilterFn} fn    匹配函数
   */
  find(fn: ElementFilterFn): IElement | null {
      let rst: IElement | null = null
      const children = this.getChildren()
      each(children, (element: IElement) => {
        if (fn(element)) {
          rst = element
        } else if (element.isGroup()) {
          rst = (element as IGroup).find(fn)
        }
        if (rst) {
          return false
        }
      })
      return rst
    }
    
  /**
   * 根据 ID 查找元素
   * @param {string} id 元素 id
   * @return {IElement|null} 元素
   */
  findById(id: string): IElement | null {
    return this.find((element) => {
      return element.get('id') === id
    })
  }

  /**
   * 是否包含对应元素
   * @param {IElement} element 元素
   * @return {boolean}
   */
  contain(element: IElement): boolean {
    const children = this.getChildren()
    return children.indexOf(element) > -1
  }

  /**
   * 移除对应子元素
   * @param {IElement} element 子元素
   * @param {boolean} destroy 是否销毁子元素，默认为 true
   */
  removeChild(element: IElement, destroy: boolean = true) : void {
    if (this.contain(element)) {
      element.remove(destroy)
    }
  }

  getChildren(): IElement[] {
    return this.get('children') as IElement[]
  }

  clear() {
    this.set('clearing', true)
    if (this.destroyed) {
      return
    }
    const children = this.getChildren()
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].destroy() // 销毁子元素
    }
    this.set('children', [])
    this.onCanvasChange('clear')
    this.set('clearing', false)
  }

  destroy() {
    if (this.get('destroyed')) {
      return
    }
    this.clear()
    super.destroy()
  }

  getShape(ev: Event): IShape {
    return {} as IShape
  }
  
}