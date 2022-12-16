import { IGroup, LooseObject, Point } from '@cc/base'
import { vec2, isBetween, clone, isString, traverse } from '@cc/util'

import { IShapeBase, IBBox, IPoint, ICircle, IRect, ComboConfig, NodeConfig, ComboTree } from '../types'
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
 * 获取两条线段的交点
 * @param  {Point}  p0 第一条线段起点
 * @param  {Point}  p1 第一条线段终点
 * @param  {Point}  p2 第二条线段起点
 * @param  {Point}  p3 第二条线段终点
 * @return {Point}  交点
 */
export const getLineIntersect = (p0: Point, p1: Point, p2: Point, p3: Point): Point | null => {
  const tolerance = 0.0001

  const E: Point = {
    x: p2.x - p0.x,
    y: p2.y - p0.y,
  }
  const D0: Point = {
    x: p1.x - p0.x,
    y: p1.y - p0.y,
  }
  const D1: Point = {
    x: p3.x - p2.x,
    y: p3.y - p2.y,
  }
  const kross: number = D0.x * D1.y - D0.y * D1.x
  const sqrKross: number = kross * kross
  const invertKross: number = 1 / kross
  const sqrLen0: number = D0.x * D0.x + D0.y * D0.y
  const sqrLen1: number = D1.x * D1.x + D1.y * D1.y
  if (sqrKross > tolerance * sqrLen0 * sqrLen1) {
    const s = (E.x * D1.y - E.y * D1.x) * invertKross
    const t = (E.x * D0.y - E.y * D0.x) * invertKross
    if (!isBetween(s, 0, 1) || !isBetween(t, 0, 1)) {
      return null
    }
    return {
      x: p0.x + s * D0.x,
      y: p0.y + s * D0.y,
    }
  }
  return null
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

/**
 * point and rectangular intersection point
 * @param  {IRect} rect  rect
 * @param  {Point} point point
 * @return {PointPoint} rst;
 */
export const getRectIntersectByPoint = (rect: IRect, point: Point): Point | null => {
  const { x, y, width, height } = rect
  const cx = x + width / 2
  const cy = y + height / 2
  const points: Point[] = []
  const center: Point = {
    x: cx,
    y: cy,
  }
  points.push({
    x,
    y,
  })
  points.push({
    x: x + width,
    y,
  })
  points.push({
    x: x + width,
    y: y + height,
  })
  points.push({
    x,
    y: y + height,
  })
  points.push({
    x,
    y,
  })
  let rst: Point | null = null
  for (let i = 1; i < points.length; i++) {
    rst = getLineIntersect(points[i - 1], points[i], center, point)
    if (rst) {
      break
    }
  }
  return rst
}

/**
 * 根据起始点，相对位置，偏移量计算控制点
 * @param startPoint 起始点， 包含 x, y
 * @param endPoint 结束点 包含 x, y
 * @param percent 相对位置 范围 0-1
 * @param offset 偏移量
 * @returns 控制点， 包含x, y
 */
export const getControlPoint = (
  startPoint: IPoint,
  endPoint: IPoint,
  percent: number = 0,
  offset: number = 0
): IPoint => {
  const point: IPoint = {
    x: (1 - percent) * startPoint.x + percent * endPoint.x,
    y: (1 - percent) * startPoint.y + percent * endPoint.y
  }
  let tangent = [0, 0]
  vec2.normalize(tangent, [endPoint.x - startPoint.x, endPoint.y - startPoint.y])

  if (!tangent || (!tangent[0] && !tangent[1])) {
    tangent = [0, 0]
  }

  const perpendicular = [-tangent[1] * offset, tangent[0] * offset] // 垂直向量
  point.x += perpendicular[0]
  point.y += perpendicular[1]

  return point
}

export const plainCombosToTrees = (array: Array<ComboConfig>, nodes?: Array<NodeConfig>) => {
  const result: ComboTree[] = []
  const addedMap: LooseObject = {}
  const modelMap: LooseObject = {}
  array.forEach((d) => {
    modelMap[d.id] = d
  })

  array.forEach(d => {
    const cd = clone(d) as ComboTree
    cd.itemType = 'combo'
    cd.children = undefined
    if (cd.parentId === cd.id) {
      console.warn(`The parentId for combo ${cd.id} can not be the same as the combo's id`)
      delete cd.parentId
    } else if (cd.parentId && !modelMap[cd.parentId]) {
      console.warn(`The parent combo for combo ${cd.id} does not exist!`)
      delete cd.parentId
    }
    let mappedObj = addedMap[cd.id]
    if (mappedObj) {
      cd.children = mappedObj.children
      addedMap[cd.id] = cd
      mappedObj = cd
      if (!mappedObj.parentId) {
        result.push(mappedObj)
        return
      }
      const mappedParent = addedMap[mappedObj.parentId]
      if (mappedParent) {
        if (mappedParent.children) {
          mappedParent.children.push(cd)
        }
        else {
          mappedParent.children = [cd]
        }
      } else {
        const parent = {
          id: mappedObj.parentId,
          children: [mappedObj]
        }
        addedMap[mappedObj.parentId] = parent
        addedMap[cd.id] = cd
      }
      return
    }

    if (isString(d.parentId)) {
      const parent = addedMap[d.parentId]
      if (parent) {
        if (parent.children) {
          parent.children.push(cd)
        }
        else {
          parent.children = [cd]
        }
        addedMap[cd.id] = cd
      } else {
        const pa = {
          id: d.parentId,
          children: [cd]
        }
        addedMap[pa.id] = pa
        addedMap[cd.id] = cd
      }
    } else {
      result.push(cd)
      addedMap[cd.id] = cd
    }
  })

  const nodeMap: LooseObject = {};
  (nodes || []).forEach((node) => {
    nodeMap[node.id] = node
    const combo = addedMap[node.comboId as string]
    if (combo) {
      const cnode: NodeConfig = {
        id: node.id,
        comboId: node.comboId as string,
      }
      if (combo.children) {combo.children.push(cnode)}
      else {combo.children = [cnode]}
      cnode.itemType = 'node'
      addedMap[node.id] = cnode
    }
  })

  let maxDepth = 0
  result.forEach((tree: ComboTree) => {
    tree.depth = maxDepth + 1
    traverse<ComboTree>(tree, (child: ComboTree) => {
      let parent
      const itemType = addedMap[child.id].itemType
      if (itemType === 'node') {
        parent = addedMap[child.comboId as string]
      } else {
        parent = addedMap[child.parentId as string]
      }
      if (parent) {
        if (itemType === 'node') {
          child.depth = maxDepth + 1
        }
        else {
          child.depth = maxDepth + 10
        }
      } else {
        child.depth = maxDepth + 10
      }
      if (maxDepth < child.depth) {maxDepth = child.depth}
      const oriNodeModel = nodeMap[child.id]
      if (oriNodeModel) {
        oriNodeModel.depth = child.depth
      }
      return true
    })
  })
  return result
}