import { isString } from '@cc/util'

import { ITEM_TYPE } from '../constants'
import { ComboConfig, EdgeConfig, ItemType, NodeConfig } from '../types'

/**
 * 验证添加节点、边或从combo时的数据
 * @param type 节点、边或从combo
 * @param data 添加的单条数据
 * @return boolean 全部验证通过返回 true，否则返回 false
 */
 export const singleDataValidation = (
  type: ItemType,
  data: NodeConfig | EdgeConfig | ComboConfig,
): boolean => {
  if (type === ITEM_TYPE.NODE || type === ITEM_TYPE.COMBO) {
    // 必须有 id 字段，且id必须为字符串类型
    if (data.id && !isString(data.id)) {
      console.warn(
        `Warning Tips: missing 'id' property, or the 'id' %c${data.id}%c is not a string.`,
        'font-size: 20px; color: red;',
        ''
      )
      return false
    }
  } else if (type === ITEM_TYPE.EDGE) {
    // 必须有 source 和 target 字段
    if (!(data as EdgeConfig).source || !(data as EdgeConfig).target) {
      console.warn('Warning Tips: missing \'source\' or \'target\' for the edge.')
      return false
    }
  }
  return true
}