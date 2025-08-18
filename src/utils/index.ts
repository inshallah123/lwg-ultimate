/**
 * 工具函数集合
 * 作用: 提供通用的工具函数，如日期处理、格式化等
 * 
 * 信息流:
 *   1. 被各个组件导入使用
 *   2. 提供纯函数，无副作用的数据处理
 *   3. 复用性高的通用逻辑
 * 
 * 与其他文件关系:
 *   - 被 components/ 下的组件使用
 *   - 被 hooks/ 下的自定义hook使用
 *   - 使用 types/ 中定义的类型
 */

/**
 * 格式化日期为字符串
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 判断两个日期是否为同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 获取月份的第一天
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 获取月份的最后一天
 */
export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}