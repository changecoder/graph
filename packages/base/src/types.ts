import { IShape, ICtor, IElement } from './interfaces'

/** 对象 */
export interface LooseObject {
  [key: string]: any
}

export type BBox = {
  x: number
  y: number
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export type ChangeType =
  | 'changeSize'
  | 'add'
  | 'sort'
  | 'clear'
  | 'attr'
  | 'show'
  | 'hide'
  | 'zIndex'
  | 'remove'
  | 'matrix'

export type Renderer = 'canvas' | 'svg'

export type CanvasCfg = {
  /**
   * 容器
   * @type {string|HTMLElement}
   */
  container: string | HTMLElement
  /**
   * 画布宽度
   * @type {number}
   */
  width: number
  /**
   * 画布高度
   * @type {number}
   */
  height: number
  /**
   * 是否可监听
   * @type {boolean}
   */
  capture?: boolean
  /**
   * 只读属性，渲染引擎
   * @type {string}
   */
  renderer?: Renderer

  [key: string]: any
}

export type Point = {
  x: number
  y: number
}

type ColorType = string | null

export type ShapeAttrs = {
  /** x 坐标 */
  x?: number
  /** y 坐标 */
  y?: number
  /** 圆半径 */
  r?: number
  /** 描边颜色 */
  stroke?: ColorType
  /** 描边透明度 */
  strokeOpacity?: number
  /** 填充颜色 */
  fill?: ColorType
  /** 填充透明度 */
  fillOpacity?: number
  /** 整体透明度 */
  opacity?: number
  /** 线宽 */
  lineWidth?: number
  /** 指定如何绘制每一条线段末端 */
  lineCap?: 'butt' | 'round' | 'square'
  /** 用来设置2个长度不为0的相连部分（线段，圆弧，曲线）如何连接在一起的属性（长度为0的变形部分，其指定的末端和控制点在同一位置，会被忽略） */
  lineJoin?: 'bevel' | 'round' | 'miter'
  /**
   * 设置线的虚线样式，可以指定一个数组。一组描述交替绘制线段和间距（坐标空间单位）长度的数字。 如果数组元素的数量是奇数， 数组的元素会被复制并重复。例如， [5, 15, 25] 会变成 [5, 15, 25, 5, 15, 25]。这个属性取决于浏览器是否支持 setLineDash() 函数。
   */
  lineDash?: number[] | null
  /** Path 路径 */
  path?: string | object[]
  /** 图形坐标点 */
  points?: object[]
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 阴影模糊效果程度 */
  shadowBlur?: number
  /** 阴影颜色 */
  shadowColor?: ColorType
  /** 阴影 x 方向偏移量 */
  shadowOffsetX?: number
  /** 阴影 y 方向偏移量 */
  shadowOffsetY?: number
  /** 设置文本内容的当前对齐方式 */
  textAlign?: 'start' | 'center' | 'end' | 'left' | 'right'
  /** 设置在绘制文本时使用的当前文本基线 */
  textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic' | 'oblique'
  /** 文本字体大小 */
  fontSize?: number
  /** 文本字体 */
  fontFamily?: string
  /** 文本粗细 */
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
  /** 字体变体 */
  fontVariant?: 'normal' | 'small-caps' | string
  /** 文本行高 */
  lineHeight?: number
  [key: string]: any
}

type ElementCfg = {
  /**
   * 元素 id,可以为空
   * @type {String}
   */
  id?: string
  /**
   * 层次索引，决定绘制的先后顺序
   * @type {Number}
   */
  zIndex?: number
  /**
   * 是否可见
   * @type {Boolean}
   */
  visible?: boolean
  /**
   * 是否可以拾取
   * @type {Boolean}
   */
  capture?: boolean
}

export type ShapeCfg = ElementCfg & {
  /**
   * 图形的属性
   * @type {ShapeAttrs}
   */
  attrs: ShapeAttrs
  [key: string]: any
}

export type GroupCfg = {
  [key: string]: any
}

export type ShapeBase = {
  [key: string]: ICtor<IShape>
}

export type ElementFilterFn = (el: IElement) => boolean