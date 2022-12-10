import { Point } from '@cc/base'
import { vec3 } from '@cc/util'
import { Matrix } from '../types'

export const applyMatrix = (point: Point, matrix: Matrix, tag: 0 | 1 = 1): Point => {
  const vector = [point.x, point.y, tag]
  if (!matrix || isNaN(matrix[0])) {
    matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
  }

  vec3.transformMat3(vector, vector, matrix)

  return {
    x: vector[0],
    y: vector[1]
  }
}

/**
 * 获取两点之间的距离
 */
export const distance = (p1: Point, p2: Point): number => {
  const vx = p1.x - p2.x
  const vy = p1.y - p2.y
  return Math.sqrt(vx * vx + vy * vy)
}