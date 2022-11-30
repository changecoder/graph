import {  AbstractGraph } from '@cc/core'

export type DataUrlType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp'

export interface IGraph extends AbstractGraph {
  /**
   * 画布导出图片
   * @param {String} name 图片的名称
   */
   downloadImage: (name?: string, type?: DataUrlType, backgroundColor?: string) => void
}