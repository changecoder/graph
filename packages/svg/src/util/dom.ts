// 创建并返回图形的 svg 元素
export function createSVGElement(type: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', type)
}
