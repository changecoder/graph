import { CCGEvent, ICCGGraphEvent } from '@cc/core'

const DELTA = 0.05

const zoomCanvas: any = {
  getDefaultCfg(): object {
    return {
      sensitivity: 2,
      minZoom: undefined,
      maxZoom: undefined
    }
  },
  getEvents(): { [key in CCGEvent]?: string } {
    return {
      wheel: 'onWheel'
    }
  },

  onWheel(e: ICCGGraphEvent) {
    const { graph, sensitivity } = this

    e.preventDefault()
    const canvas = graph.get('canvas')
    const point = canvas.getPointByClient(e.clientX, e.clientY)

    const graphZoom = graph.getZoom()

    let ratio = graphZoom
    let zoom = graphZoom

    if (e.wheelDelta < 0) {
      ratio = 1 - DELTA * sensitivity
    } else {
      ratio = 1 / (1 - DELTA * sensitivity)
    }

    zoom = graphZoom * ratio

    const minZoom = this.get('minZoom') || graph.get('minZoom')
    const maxZoom = this.get('maxZoom') || graph.get('maxZoom')
    if (zoom > maxZoom) {
      zoom = maxZoom
    } else if (zoom < minZoom) {
      zoom = minZoom
    }
    console.log('-----zoom------', zoom)
    graph.zoomTo(zoom, { x: point.x, y: point.y })
    graph.emit('wheelzoom', e)
  }
}

export default zoomCanvas