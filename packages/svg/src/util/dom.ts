import { SHAPE_TO_TAGS } from '../constants'
import { IGroup, IShape } from '../interfaces'

// 创建并返回图形的 svg 元素
export function createSVGElement(type: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', type)
}

/**
 * 创建并返回图形的 dom 元素
 * @param  {IShape} shape 图形
 * @return {SVGElement}
 */
 export function createDom(shape: IShape) {
  const type = SHAPE_TO_TAGS[shape.type]
  const parent = shape.getParent()
  if (!type) {
    throw new Error(`the type ${shape.type} is not supported by svg`)
  }
  const element = createSVGElement(type)
  if (shape.get('id')) {
    element.id = shape.get('id')
  }
  shape.set('el', element)
  shape.set('attrs', {})
  // 对于 defs 下的 dom 节点，parent 为空，通过 context 统一挂载到 defs 节点下
  if (parent) {
    let parentNode = parent.get('el')
    if (parentNode) {
      parentNode.appendChild(element)
    } else {
      // parentNode maybe null for group
      parentNode = (parent as IGroup).createDom()
      parent.set('el', parentNode)
      parentNode.appendChild(element)
    }
  }
  return element
}
