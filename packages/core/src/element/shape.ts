import { IGroup, IShape } from '@cc/base'
import { isFunction, isString, upperFirst } from '@cc/util'
import { ShapeOptions } from '../interface'
import { ModelConfig } from '../types'

/**
 * 工厂方法的基类
 * @type Shape.FactoryBase
 */
export const ShapeFactoryBase = {
  defaultShapeType: 'defaultType',

  getShape(type?: string): ShapeOptions {
    const self = this as any
    const shape = self[type!] || self[self.defaultShapeType] || self['simple-circle']
    return shape
  },

  draw(type: string, cfg: ModelConfig, group: IGroup): IShape {
    const shape = this.getShape(type)
    const rst = shape.draw!(cfg, group)
    if (shape.afterDraw) {
      shape.afterDraw(cfg, group, rst)
    }
    return rst
  }
}

/**
 * 元素的框架
 */
const ShapeFramework = {

}

export default class Shape {
  public static Node: any

  public static Edge: any

  public static Combo: any

  public static registerFactory(factoryType: string, cfg: object): object {
    const className = upperFirst(factoryType)
    const factoryBase = ShapeFactoryBase
    const shapeFactory = { ...factoryBase, ...cfg } as any
    (Shape as any)[className] = shapeFactory
    shapeFactory.className = className
    return shapeFactory
  }

  public static getFactory(factoryType: string) {
    const className = upperFirst(factoryType)
    return (Shape as any)[className]
  }


  public static registerNode(
    shapeType: string,
    nodeDefinition: ShapeOptions,
    extendShapeType?: string
  ) {
    const shapeFactory = Shape.Node
    let shapeObj

    if (isString(nodeDefinition) || isFunction(nodeDefinition)) {
      console.warn('等待处理')
    } else {
      const extendShape = extendShapeType ? shapeFactory.getShape(extendShapeType) : ShapeFramework
      shapeObj = { ...extendShape, ...nodeDefinition }
    }

    shapeObj.type = shapeType
    shapeObj.itemType = 'node'
    shapeFactory[shapeType] = shapeObj
    return shapeObj
  }
}

// 注册 Node 的工厂方法
Shape.registerFactory('node', {
  defaultShapeType: 'circle'
})