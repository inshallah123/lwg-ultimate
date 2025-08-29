/**
 * 更新相关的类型定义
 */

export interface UpdateProgressData {
  percent: number;
  bytesPerSecond?: number;
  total?: number;
  transferred?: number;
}