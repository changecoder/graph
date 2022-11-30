import { mix } from '@cc/util'

import EventEmitter from '../event-emitter'
import { IBase } from '../interfaces'
import { LooseObject } from '../types'

export default abstract class Base extends EventEmitter implements IBase {
  /**
   * 内部属性，用于 get,set，但是可以用于优化性能使用
   * @type {object}
   */
  cfg: LooseObject

  /**
   * 是否被销毁
   * @type {boolean}
   */
  destroyed: boolean = false

  constructor(cfg: any) {
    super()
    const defaultCfg = this.getDefaultCfg()
    this.cfg = mix(defaultCfg, cfg)
  }

  get(name: string): any {
    return this.cfg[name]
  }

  set(name: string, value: any): void {
    this.cfg[name] = value
  }

  /**
   * @protected
   * 默认的配置项
   * @returns {object} 默认的配置项
   */
  getDefaultCfg(): object {
    return {}
  }

  destroy(): void {
    this.cfg = {
      destroyed: true
    }
    this.destroyed = true
  }

}