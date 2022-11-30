import { IGroup, IShape } from '@cc/base'
import { isArray } from '@cc/util'

import { ShapeOptions } from '../interface'
import { ModelConfig, NodeConfig } from '../types'
import Shape from './shape'
import { shapeBase } from './shapeBase'
import Global from '../global'

const singleNode: ShapeOptions = {
  itemType: 'node',
  // 单个图形的类型
  shapeType: 'single-node',
  getSize(cfg: ModelConfig): number[] {
    let size: number | number[] = cfg.size || this.getOptions({})!.size || Global.defaultNode.size

    // size 是数组，但长度为1，则补长度为2
    if (isArray(size) && size.length === 1) {
      size = [size[0], size[0]]
    }

    // size 为数字，则转换为数组
    if (!isArray(size)) {
      size = [size, size]
    }
    return size
  },
  drawShape(cfg: NodeConfig, group: IGroup): IShape {
    const { shapeType } = this
    const style = this.getShapeStyle!(cfg)
    const shape = group.addShape(shapeType as string, {
      attrs: style,
      draggable: true,
      name: 'node-shape',
    })
    group.shapeMap['node-shape'] = shape
    return shape
  }
}

const singleNodeDef = { ...shapeBase, ...singleNode }

Shape.registerNode('single-node', singleNodeDef)