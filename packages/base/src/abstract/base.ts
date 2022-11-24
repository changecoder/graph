import { mix } from '@graph/util'

import EventEmitter from '../event-emitter'
import { IBase } from '../interfaces'
import { LooseObject } from '../types'

export default abstract class Base extends EventEmitter implements IBase {
  constructor(cfg: any) {
    super()
    const defaultCfg = this.getDefaultCfg()
    this.cfg = mix(defaultCfg, cfg)
  }
  
  /**
   * 内部属性，用于 get,set，但是可以用于优化性能使用
   * @type {object}
   */
  cfg: LooseObject

  get(name: string) {
    throw new Error('Method not implemented.')
  }

  set(name: string, value: any): void {
    throw new Error('Method not implemented.')
  }

    /**
   * @protected
   * 默认的配置项
   * @returns {object} 默认的配置项
   */
  getDefaultCfg(): object {
    return {}
  }
    
  /**
   * 是否被销毁
   * @type {boolean}
   */
  destroyed: boolean = false

  destroy(): void {
    throw new Error('Method not implemented.')
  }

}