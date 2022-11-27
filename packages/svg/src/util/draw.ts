import { ChangeType } from '@graph/base'
import Defs from '../defs'
import { IElement } from '../interfaces'

export function drawChildren(context: Defs, children: IElement[]) {
  children.forEach((child) => {
    child.draw(context)
  })
}

/**
 * 更新元素，包括 group 和 shape
 * @param {IElement} element       SVG 元素
 * @param {ChangeType} changeType  更新类型
 */
export function refreshElement(element: IElement, changeType: ChangeType) {
  console.log('等待编码')
}