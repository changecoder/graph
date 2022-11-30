import { ChangeType } from '@cc/base'
import Defs from '../defs'
import { IElement } from '../interfaces'
import { setTransform } from './svg'

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
  // 对于还没有挂载到画布下的元素，canvas 可能为空
  const canvas = element.get('canvas')
  // 只有挂载到画布下，才对元素进行实际渲染
  if (canvas && canvas.get('autoDraw')) {
    const context = canvas.get('context')
    if (changeType === 'matrix') {
      setTransform(element)
    } else if (changeType === 'add') {
      element.draw(context)
    }
  }
}