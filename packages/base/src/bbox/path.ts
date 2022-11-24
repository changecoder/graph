import { SimpleBBox } from '../types'
import { IShape } from '../interfaces'

export default function (shape: IShape): SimpleBBox {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }
}