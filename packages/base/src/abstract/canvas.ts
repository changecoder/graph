import { isString } from "@graph/util"
import { PX_SUFFIX } from "../constants"
import EventController from "../event/event-controller"

import { ICanvas } from "../interfaces"
import { CanvasCfg, Renderer } from "../types"
import { isBrowser } from "../util"
import Container from "./container"

export default abstract class Canvas extends Container implements ICanvas {
  constructor(cfg: CanvasCfg) {
    super(cfg)
    this.initContainer()
    this.initDom()
    this.initEvents()
  }


  // 初始化容器
  initContainer() {
      let container = this.get('container')
      if (isString(container)) {
        container = document.getElementById(container)
        this.set('container', container)
      }
  }

    // 初始化DOM
    initDom() {
      const el = this.createDom()
      this.set('el', el)
      // 附加到容器
      const container = this.get('container')
      container.appendChild(el)
      // 设置初始宽度
      this.setDOMSize(this.get('width'), this.get('height'))
    }

    initEvents() {
      const eventController = new EventController({
        canvas: this
      })
      eventController.init()
      this.set('eventController', eventController)
    }

  /**
   * @protected
   * 修改画布对应的 DOM 的大小
   * @param {number} width  宽度
   * @param {number} height 高度
   */
   setDOMSize(width: number, height: number) {
    const el = this.get('el')
    if (isBrowser) {
      el.style.width = width + PX_SUFFIX
      el.style.height = height + PX_SUFFIX
    }
  }

  changeSize(width: number, height: number) {
    this.setDOMSize(width, height)
    this.set('width', width)
    this.set('height', height)
    this.onCanvasChange('changeSize')
  }

  getRenderer(): Renderer {
    return this.get('renderer')
  }

  draw() {}

  isCanvas() {
    return true
  }

  /**
   * 创建画布容器
   * @return {HTMLElement} 画布容器
   */
  abstract createDom(): HTMLElement | SVGSVGElement
}