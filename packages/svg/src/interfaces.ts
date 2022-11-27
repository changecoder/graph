import { IElement as IBaseElement, IGroup as IBaseGroup } from '@graph/base'
import Defs from './defs'

export interface IElement extends IBaseElement {
  /**
   * 裁剪和绘制图形元素
   * @param {Defs} context 上下文
   */
  draw(context: Defs, targetAttrs?: { [key: string] : any}): void
}

export interface IGroup extends IBaseGroup {
  /**
   * 创建分组容器，对应 <g> 元素
   * @return {SVGGElement} 分组容器
   */
  createDom(): SVGGElement
}