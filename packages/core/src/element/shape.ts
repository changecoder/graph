import { IGroup, IShape } from '@cc/base'
import { isFunction, isString, upperFirst } from '@cc/util'
import { ShapeOptions } from '../interface'
import { EdgeConfig, IPoint, Item, ModelConfig, NodeConfig, UpdateType } from '../types'

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

  getControlPoints(type: string, cfg: ModelConfig): IPoint[] | undefined {
    const shape = this.getShape(type)
    return shape.getControlPoints!(cfg)
  },

  /**
   * 获取控制点
   * @param {String} type 节点、边类型
   * @param  {Object} cfg 节点、边的配置项
   * @return {Array|null} 控制点的数组,如果为 null，则没有控制点
   */
  getAnchorPoints(type: string, cfg: ModelConfig): number[][] | undefined {
    const shape = this.getShape(type)
    return shape.getAnchorPoints!(cfg)
  },
    
  /**
   * 是否允许更新，不重新绘制图形
   * @param  {String} type 类型
   * @return {Boolean} 是否允许使用更新
   */
  shouldUpdate(type: string): boolean {
    const shape = this.getShape(type)
    return !!shape.update
  },

  baseUpdate(type: string, cfg: ModelConfig, item: Item, updateType?: UpdateType) {
    const shape = this.getShape(type)

    // 防止没定义 update 函数
    if (shape.update) {
      // shape.mergeStyle = updateType === 'move' || updateType === 'bbox' ? {} : shape.getOptions?.(cfg);
      shape.mergeStyle = shape.getOptions?.(cfg)
      shape.update?.(cfg, item, updateType)
    }
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
  // 默认样式及配置
  options: {},
  /**
   * 获取控制点
   * @param  {Object} cfg 节点、边的配置项
   * @return {Array|null} 控制点的数组,如果为 null，则没有控制点
   */
  getAnchorPoints(cfg: NodeConfig | EdgeConfig) {
    const { anchorPoints: defaultAnchorPoints } = this.options as any
    const anchorPoints = cfg.anchorPoints || defaultAnchorPoints
    return anchorPoints
  }
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

  public static registerEdge(
    shapeType: string,
    edgeDefinition: ShapeOptions,
    extendShapeType?: string
  ) {
    const shapeFactory = Shape.Edge
    const extendShape = extendShapeType ? shapeFactory.getShape(extendShapeType) : ShapeFramework
    const shapeObj = { ...extendShape, ...edgeDefinition }
    shapeObj.type = shapeType
    shapeObj.itemType = 'edge'
    shapeFactory[shapeType] = shapeObj
    return shapeObj
  }
}

// 注册 Node 的工厂方法
Shape.registerFactory('node', {
  defaultShapeType: 'circle'
})

// 注册 Edge 的工厂方法
Shape.registerFactory('edge', {
  defaultShapeType: 'line'
})