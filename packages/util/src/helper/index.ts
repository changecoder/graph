export * from './tree'

/**
 * 是否在区间内
 * @param   {number}       value  值
 * @param   {number}       min    最小值
 * @param   {number}       max    最大值
 * @return  {boolean}      bool   布尔
 */
export const isBetween = (value: number, min: number, max: number): boolean => value >= min && value <= max

