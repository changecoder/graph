/**
 * 层次结构数据递归遍历
 * @param data 
 * @param fn 
 * @returns 
 */
export const traverse = <T extends { children?: T[] }>(data: T, fn: (param: T) => boolean) => {
  if (fn(data) === false) {
    return false
  }

  if (data && data.children) {
    for (let i = data.children.length - 1; i >= 0; i--) {
      if (!traverse(data.children[i], fn)) {
        return false
      }
    }
  }
  return true
}

// 从叶子节点到根节点
export const traverseUp = <T extends { children?: T[] }>(data: T, fn: (param: T) => boolean) => {
  if (data && data.children) {
    for (let i = data.children.length - 1; i >= 0; i--) {
      if (!traverseUp(data.children[i], fn)) {
        return
      }
    }
  }

  if (fn(data) === false) {
    return false
  }
  return true
}

export const traverseTreeUp = <T extends { children?: T[] }>(
  data: T,
  fn: (param: T) => boolean,
) => {
  if (typeof fn !== 'function') {
    return
  }
  traverseUp(data, fn)
}