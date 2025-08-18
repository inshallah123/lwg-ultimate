/**
 * TypeScript类型定义文件
 * 作用: 定义整个应用使用的TypeScript类型和接口
 * 
 * 信息流:
 *   1. 被各个组件和工具函数导入使用
 *   2. 提供类型检查和代码提示
 *   3. 确保数据结构的一致性
 * 
 * 与其他文件关系:
 *   - 被 components/ 下的组件导入使用
 *   - 被 utils/ hooks/ 等工具文件使用
 *   - 与后端数据接口保持一致
 */

// 事件相关类型
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color?: string;
}

// 日期相关类型
export interface DateRange {
  start: Date;
  end: Date;
}

// 视图模式类型
export type ViewMode = 'month' | 'week' | 'day';

// 窗口状态类型(与Electron主进程共享)
export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
}