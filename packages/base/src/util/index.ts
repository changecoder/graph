import { ICanvas, IContainer, IElement } from '../interfaces'

export function removeFromArray(arr: any[], obj: any) {
  const index = arr.indexOf(obj)
  if (index !== -1) {
    arr.splice(index, 1)
  }
}

export function removeChild(container: IContainer, element: IElement, destroy: boolean = true) {
  // 不再调用 element.remove() 方法，会出现循环调用
  if (destroy) {
    element.destroy()
  } else {
    element.set('parent', null)
    element.set('canvas', null)
  }
  removeFromArray(container.getChildren(), element)
}

/**
 * 设置 canvas
 * @param {IElement} element 元素
 * @param {ICanvas}  canvas  画布
 */
export function setCanvas(element: IElement, canvas: ICanvas) {
  element.set('canvas', canvas)
  if (element.isGroup()) {
    const children = element.get('children')
    if (children.length) {
      children.forEach((child: IElement) => {
        setCanvas(child, canvas)
      })
    }
  }
}

// 是否浏览器环境
export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'