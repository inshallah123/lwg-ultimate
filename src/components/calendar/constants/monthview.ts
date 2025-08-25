/**
 * 月视图常量配置
 */

// 滚动配置
export const SCROLL_CONFIG = {
  SPEED: 0.25,                // 滚动速度系数
  TIMEOUT: 200,                // 滚动结束延迟
  BASE_THRESHOLD: 48,          // 基础加载阈值（行数）
  VELOCITY_THRESHOLD: 30,      // 高速滚动速度阈值
  MONTHS_TO_LOAD_NORMAL: 6,    // 正常加载月份数
  MONTHS_TO_LOAD_FAST: 12,     // 快速滚动时加载月份数
};

// 缓冲配置
export const BUFFER_ROWS = {
  IDLE: 4,       // 静止时的缓冲行数
  SCROLLING: 6,  // 滚动时的缓冲行数
};

// 月份范围
export const MONTH_RANGE = {
  START_OFFSET: -6,  // 初始起始月份偏移
  END_OFFSET: 6,     // 初始结束月份偏移
};

// 视图配置
export const VIEW_CONFIG = {
  ROWS_PER_SCREEN: 6,     // 每屏显示的行数
  DAYS_PER_WEEK: 7,       // 每周天数
  DEFAULT_ROW_HEIGHT: 100, // 默认行高
};

// 导航配置
export const NAVIGATION = {
  CENTER_ROW_OFFSET: 2,    // 居中显示时的行偏移
  MONTH_STEP: 1,           // 月份导航步长
};