import { IGroup, Point } from '@cc/base'
import { IShapeBase, IBBox, IPoint, ICircle } from '../types'

export const getBBox = (element: IShapeBase, group: IGroup): IBBox => {
  const bbox = element.getBBox()
  let leftTop: IPoint = {
    x: bbox.minX,
    y: bbox.minY,
  }
  let rightBottom: IPoint = {
    x: bbox.maxX,
    y: bbox.maxY
  }
  // 根据父元素变换矩阵
  if (group) {
    console.log('暂不处理')
  }

  const { x: lx, y: ly } = leftTop
  const { x: rx, y: ry } = rightBottom

  return {
    x: lx,
    y: ly,
    minX: lx,
    minY: ly,
    maxX: rx,
    maxY: ry,
    width: rx - lx,
    height: ry - ly
  }
}

export const getCircleIntersectByPoint = (circle: ICircle, point: Point): Point | null => {
  const { x: cx, y: cy, r } = circle
  const { x, y } = point

  const dx = x - cx
  const dy = y - cy
  if (dx * dx + dy * dy < r * r) {
    return null
  }
  const angle = Math.atan(dy / dx)
  return {
    x: cx + Math.abs(r * Math.cos(angle)) * Math.sign(dx),
    y: cy + Math.abs(r * Math.sin(angle)) * Math.sign(dy)
  }
}