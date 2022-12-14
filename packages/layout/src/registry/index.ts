import { isObject } from '@cc/util'
import { Base } from '../layout/base'

const map: Map<string, any> = new Map()

export const registerLayout = (name: string, layoutOverride: any) => {
  if (map.get(name)) {
    console.warn(`The layout with the name ${name} exists already, it will be overridden`)
  }
  if (isObject(layoutOverride)) {
    class GLayout extends Base {
      constructor(cfg: any) {
        super()
        const self = this as any
        const props: any = {}
        const defaultCfg = self.getDefaultCfg()
        Object.assign(props, defaultCfg, layoutOverride, cfg as unknown)
        Object.keys(props).forEach((key: string) => {
          const value = props[key]
          self[key] = value
        })
      }
    }
    map.set(name, GLayout)
  } else {
    map.set(name, layoutOverride)
  }
  return map.get(name)
}

export const unRegisterLayout = (name: string) => {
  if (map.has(name)) {
    map.delete(name)
  }
}

export const getLayoutByName = (name: string) => {
  if (map.has(name)) {
    return map.get(name)
  }
  return null
}
