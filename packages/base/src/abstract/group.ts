import { IGroup } from '../interfaces'
import Container from './container'

export default abstract class AbstractGroup extends Container implements IGroup {
  shapeMap = {}
  
  isGroup() {
    return true
  }

  isEntityGroup() {
    return false
  }

  clone() {
    const clone = super.clone()
    // 获取构造函数
    const children = this.getChildren()
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      clone.add(child.clone())
    }
    return clone
  }
}