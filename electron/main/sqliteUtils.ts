import * as path from 'path';
import * as fs from 'fs';

// sql.js 没有 TypeScript 定义，使用 require 导入
// eslint-disable-next-line @typescript-eslint/no-var-requires
const initSqlJs = require('sql.js') as (config?: {
  locateFile?: (file: string) => string;
}) => Promise<{
  Database: new (data?: Uint8Array) => SQLiteDatabase;
}>;

// Statement 接口定义
export interface Statement {
  bind: (params: EventParams | ThemeParams | Record<string, string | number | null>) => void;
  step: () => boolean;
  getAsObject: () => EventRow | ThemeRow | Record<string, never>;
  free: () => void;
  reset: () => void;
}

// SQLite 数据库接口
export interface SQLiteDatabase {
  run: (sql: string, params?: Array<string | number | null>) => void;
  prepare: (sql: string) => Statement;
  exec: (sql: string) => void;
  export: () => Uint8Array;
  close: () => void;
}

// 事件数据库参数接口
export interface EventParams {
  $id: string;
  $title: string;
  $description: string | null;
  $date: number;
  $timeSlot: string;
  $tag: string;
  $customTag: string | null;
  $recurrence: string;
  $customRecurrence: number | null;
  $createdAt: number;
  $updatedAt: number;
  $excludedDates: string | null;
  $recurrenceEndDate: number | null;
}

// 事件数据库行接口
export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  date: number;
  timeSlot: string;
  tag: string;
  customTag: string | null;
  recurrence: string;
  customRecurrence: number | null;
  createdAt: number;
  updatedAt: number;
  excludedDates: string | null;
  recurrenceEndDate: number | null;
}

// 主题数据库行接口
export interface ThemeRow {
  id: number;
  name: string;
  config: string;
  createdAt: string;
  updatedAt: string;
}

// 主题数据库参数接口
export interface ThemeParams {
  $id?: number;
  $name: string;
  $config: string;
  $createdAt: string;
  $updatedAt: string;
}

/**
 * 初始化 sql.js 库
 * @returns SQL 模块，包含 Database 构造函数
 */
export async function initializeSqlJs() {
  return await initSqlJs({
    locateFile: (file: string) => path.join(__dirname, '../../../node_modules/sql.js/dist', file)
  });
}
/**
 * 加载或创建数据库实例
 * @param dbPath 数据库文件路径
 * @returns 数据库实例
 */
export async function loadOrCreateDatabase(dbPath: string): Promise<SQLiteDatabase> {
  const SQL = await initializeSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath);
    return new SQL.Database(data);
  } else {
    return new SQL.Database();
  }
}