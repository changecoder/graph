import { AbstractGraph, GraphOptions } from '@cc/core'
import { Canvas as GSVGCanvas } from '@cc/svg'

import { DataUrlType, IGraph } from '../interface/graph'
import { LayoutController, EventController } from './controller'

const SVG = 'svg'

export default class Graph extends AbstractGraph implements IGraph {
  public destroyed: boolean

  constructor(cfg: GraphOptions) {
    super(cfg)
    const defaultNode = this.get('defaultNode')
    if (!defaultNode) {
      this.set('defaultNode', { type: 'circle' })
    } else if (!defaultNode.type) {
      defaultNode.type = 'circle'
      this.set('defaultNode', defaultNode)
    }
    this.destroyed = false
  }

  downloadImage(name?: string | undefined, type?: DataUrlType | undefined, backgroundColor?: string | undefined) {
    
  }

  protected initLayoutController() {
    const layoutController = new LayoutController(this)
    this.set({
      layoutController
    })
  }

  protected initEventController() {
    const eventController = new EventController(this)
    this.set({
      eventController
    })
  }

  protected initCanvas() {
    let container: string | HTMLElement | Element | null = this.get('container')
    if (typeof container === 'string') {
      container = document.getElementById(container)
      this.set('container', container)
    }

    if (!container) {
      throw new Error('invalid container')
    }

    const { clientWidth, clientHeight } = container
    const width: number = this.get('width') || clientWidth
    const height: number = this.get('height') || clientHeight

    if (!this.get('width') && !this.get('height')) {
      this.set('width', clientWidth)
      this.set('height', clientHeight)
    }

    const renderer: string = this.get('renderer')

    let canvas

    if (renderer === SVG) {
      canvas = new GSVGCanvas({
        container: container as HTMLElement,
        width,
        height
      })
    } else {
      console.warn('暂未实现canvas')
    }

    this.set('canvas', canvas)
  }
}