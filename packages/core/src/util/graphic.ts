import { IGroup, Point } from '@cc/base'
import { IShapeBase, IBBox, IPoint, ICircle } from '../types'
import { applyMatrix } from './math'

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
    let matrix = group.getMatrix()
    if (!matrix) {
      matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
    }
    leftTop = applyMatrix(leftTop, matrix)
    rightBottom = applyMatrix(rightBottom, matrix)
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


/**
 * 向量解法(后续加入)
 * 目标点减去圆心得到的向量方向就是从圆心指向目标点
 * 将这个向量长度限制为半径（方法很多，比如说转为极坐标）
 * 根据首尾相加的原则，圆心加上此向量就是圆周上的一点了。
 */
// 计算圆形从中心点到指定位置半径的坐标
export const getCircleIntersectByPoint = (circle: ICircle, point: Point): Point | null => {
  const { x: cx, y: cy, r } = circle
  const { x, y } = point

  const dx = x - cx
  const dy = y - cy
  if (dx * dx + dy * dy < r * r) {
    return null
  }
  const angle = Math.atan2(dy, dx)
  return {
    x: cx + Math.abs(r * Math.cos(angle)) * Math.sign(dx),
    y: cy + Math.abs(r * Math.sin(angle)) * Math.sign(dy)
  }
}