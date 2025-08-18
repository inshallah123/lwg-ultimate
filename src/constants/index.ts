/**
 * 常量定义文件
 * 作用: 定义应用中使用的常量，如颜色、尺寸、配置等
 * 
 * 信息流:
 *   1. 被各个组件和工具函数导入使用
 *   2. 集中管理配置项，便于维护
 *   3. 避免魔法数字和字符串
 * 
 * 与其他文件关系:
 *   - 被 components/ 下的组件使用
 *   - 被 styles/ 下的样式文件引用
 *   - 与设计系统保持一致
 */

// 日历相关常量
export const CALENDAR = {
  DAYS_PER_WEEK: 7,
  WEEKS_PER_MONTH: 6,
  MONTH_NAMES: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  WEEKDAY_NAMES: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  WEEKDAY_NAMES_FULL: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ]
} as const;

// 主题颜色
export const COLORS = {
  PRIMARY: '#007bff',
  SECONDARY: '#6c757d',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  LIGHT: '#f8f9fa',
  DARK: '#343a40'
} as const;

// 应用配置
export const APP_CONFIG = {
  NAME: 'Little White Goose Calendar',
  VERSION: '1.0.0',
  DEFAULT_VIEW: 'month' as const
} as const;