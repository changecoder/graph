import { INode } from '../interface'
import Item from './item'

export default class Node extends Item implements INode {
  public getDefaultCfg() {
    return {
      type: 'node',
      edges: []
    }
  }
}