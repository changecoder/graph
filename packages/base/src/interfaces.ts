import GraphEvent from './event/graph-event'
import {
  LooseObject,
  ChangeType,
  ShapeBase,
  ShapeCfg,
  GroupCfg,
  Renderer,
  ElementFilterFn,
} from './types'

export interface ICtor<T> {
  new (cfg: any): T
}

/**
 * @interface IObservable
 * 可以绑定事件的接口
 */
export interface IObservable {
  /**
   * 绑定事件
   * @param  eventName 事件名
   * @param callback  回调函数
   */
  on(eventName: string, callback: Function): void
  /**
   * 移除事件
   */
  off(): void
  /**
   * 移除事件
   * @param eventName 事件名
   */
  off(eventName: string): void
  /**
   * 移除事件
   * @param eventName 事件名
   * @param callback  回调函数
   */
  off(eventName: string, callback: Function): void
  /**
   * 触发事件, trigger 的别名函数
   * @param eventName 事件名称
   * @param eventObject 参数
   */
  emit(eventName: string, eventObject: object): void

  getEvents(): any
}

/**
 * @interface IBase
 * 所有图形类公共的接口，提供 get,set 方法
 */
 export interface IBase extends IObservable {
  cfg: LooseObject
  /**
   * 获取属性值
   * @param  {string} name 属性名
   * @return {any} 属性值
   */
  get(name: string): any
  /**
   * 设置属性值
   * @param {string} name  属性名称
   * @param {any}    value 属性值
   */
  set(name: string, value: any): void

  /**
   * 是否销毁
   * @type {boolean}
   */
  destroyed: boolean

  /**
   * 销毁对象
   */
  destroy(): void
}

/**
 * @interface
 * 图形元素的基类
 */
 export interface IElement extends IBase {
  /**
   * 获取父元素
   * @return {IContainer} 父元素一般是 Group 或者是 Canvas
   */
  getParent(): IContainer

  /**
   * 获取所属的 Canvas
   * @return {ICanvas} Canvas 对象
   */
  getCanvas(): ICanvas

  /**
   * 获取 Shape 的基类
   * @return {IShape} Shape 的基类，用作工厂方法来获取类实例
   */
  getShapeBase(): ShapeBase

  /**
   * 获取 Group 的基类，用于添加默认的 Group
   * @return {IGroup} group 类型
   */
  getGroupBase(): ICtor<IGroup>

  /**
   * 当引擎画布变化时，可以调用这个方法，告知 canvas 图形属性发生了改变
   * 这个方法一般不要直接调用，在实现 element 的继承类时可以复写
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType): void

  /**
   * 是否是分组
   * @return {boolean} 是否是分组
   */
  isGroup(): boolean
  /**
   * 从父元素中移除
   * @param {boolean} destroy 是否同时销毁
   */
  remove(destroy?: boolean): void
  /**
   * 获取全量的图形属性
   */
  attr(): any
  /**
   * 获取图形属性
   * @param {string} name 图形属性名
   * @returns 图形属性值
   */
  attr(name: string): any
  /**
   * 设置图形属性
   * @param {string} name  图形属性名
   * @param {any}    value 图形属性值
   */
  attr(name: string, value: any): void
  /**
   * 设置图形属性
   * @param {object} attrs 图形属性配置项，键值对方式
   */
  attr(attrs: object): void

  /**
   * 复制对象
   */
  clone(): IElement
  /**
   * 显示
   */
  show(): void
  /**
   * 隐藏
   */
  hide(): void
  /**
   * 设置 zIndex
   */
  setZIndex(zIndex: number): void

  /**
   * 触发委托事件
   * @param  {string}  type 事件类型
   * @param  {GraphEvent}  eventObj 事件对象
   */
  emitDelegation(type: string, eventObj: GraphEvent): void;
}

export interface IContainer extends IElement {
  /**
   * 添加图形
   * @param {ShapeCfg} cfg  图形配置项
   * @returns 添加的图形对象
   */
  addShape(cfg: ShapeCfg): IShape

  /**
   * 添加图形
   * @param {string} type 图形类型
   * @param {ShapeCfg} cfg  图形配置项
   * @returns 添加的图形对象
   */
  addShape(type: string, cfg: ShapeCfg): IShape

  /**
   * 容器是否是 Canvas 画布
   */
  isCanvas(): boolean

  /**
   * 添加图形分组，增加一个默认的 Group
   * @returns 添加的图形分组
   */
  addGroup(): IGroup

  /**
   * 添加图形分组，并设置配置项
   * @param {GroupCfg} cfg 图形分组的配置项
   * @returns 添加的图形分组
   */
  addGroup(cfg: GroupCfg): IGroup

  /**
   * 添加图形分组，指定类型
   * @param {IGroup} classConstructor 图形分组的构造函数
   * @param {GroupCfg} cfg 图形分组配置项
   * @returns 添加的图形分组
   */
  addGroup(classConstructor: IGroup, cfg: GroupCfg): IGroup

  /**
   * 根据 x,y 获取对应的图形
   * @param {Event} 浏览器事件对象
   * @returns 添加的图形分组
   */
  getShape(ev: Event): IShape

  /**
   * 添加图形元素，已经在外面构造好的类
   * @param {IElement} element 图形元素（图形或者分组）
   */
  add(element: IElement): void

  /**
   * 获取父元素
   * @return {IContainer} 父元素一般是 Group 或者是 Canvas
   */
  getParent(): IContainer

  /**
   * 获取所有的子元素
   * @return {IElement[]} 子元素的集合
   */
  getChildren(): IElement[]

  /**
   * 清理所有的子元素
   */
  clear(): void

  /**
   * 是否包含对应元素
   * @param {IElement} element 元素
   * @return {boolean}
   */
  contain(element: IElement): boolean

  /**
   * 移除对应子元素
   * @param {IElement} element 子元素
   * @param {boolean} destroy 是否销毁子元素，默认为 true
   */
  removeChild(element: IElement, destroy?: boolean): void

  /**
   * 查找元素，找到第一个返回
   * @param  {ElementFilterFn} fn 匹配函数
   * @return {IElement|null} 元素，可以为空
   */
  find(fn: ElementFilterFn): IElement | null

  /**
   * 根据 ID 查找元素
   * @param {string} id 元素 id
   * @return {IElement | null} 元素
   */
  findById(id: string): IElement | null
}

export interface IGroup extends IElement, IContainer {
  /**
   * 是否是实体分组，即对应实际的渲染元素
   * @return {boolean} 是否是实体分组
   */
  isEntityGroup(): boolean
}

/**
 * @interface ICanvas
 * 画布，图形的容器
 */
 export interface ICanvas extends IContainer {
  /**
   * 获取当前的渲染引擎
   * @return {Renderer} 返回当前的渲染引擎
   */
  getRenderer(): Renderer

  /**
   * 为了兼容持续向上查找 parent
   * @return {IContainer} 返回元素的父容器，在 canvas 中始终是 null
   */
  getParent(): IContainer

  /**
   * 改变画布大小
   * @param {number} width  宽度
   * @param {number} height 高度
   */
  changeSize(width: number, height: number): void

  /**
   * 绘制
   */
  draw(): void
}

export interface IShape extends IElement {}

export interface StringKeyObject {
  [key: string]: any
}