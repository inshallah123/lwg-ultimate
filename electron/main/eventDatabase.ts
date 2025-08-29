import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { Event } from '../../src/types/event';
import { 
  SQLiteDatabase, 
  EventRow, 
  EventParams, 
  loadOrCreateDatabase 
} from './sqliteUtils';

class EventDatabase {
  private db: SQLiteDatabase | null = null;
  private dbPath: string = '';
  
  // SQL 语句常量
  //noinspection SqlDialectInspection,SqlNoDataSourceInspection
  private readonly INSERT_EVENT_SQL = `
    INSERT INTO events (
      id, title, description, date, timeSlot, tag, customTag,
      recurrence, customRecurrence, createdAt, updatedAt,
      excludedDates, recurrenceEndDate
    ) VALUES (
      $id, $title, $description, $date, $timeSlot, $tag, $customTag,
      $recurrence, $customRecurrence, $createdAt, $updatedAt,
      $excludedDates, $recurrenceEndDate
    )
  `;

  async initialize() {
    try {
      // 确保app已经准备好
      let userDataPath: string;
      try {
        userDataPath = app.getPath('userData');
      } catch {
        console.log('App not ready, using fallback path');
        // 如果app还没准备好，使用默认路径
        userDataPath = app.isPackaged 
          ? path.join(process.resourcesPath, '..')
          : path.join(process.cwd(), 'userData');
      }
      
      // 确保目录存在
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
      
      this.dbPath = path.join(userDataPath, 'events.db');
      
      // 输出数据库路径用于调试
      console.log('Database location:', this.dbPath);
      console.log('Database directory exists:', fs.existsSync(path.dirname(this.dbPath)));
      
      // 加载或创建数据库
      this.db = await loadOrCreateDatabase(this.dbPath);
      
      this.initDatabase();
      this.saveDatabase();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error in EventDatabase initialization:', error);
      throw error;
    }
  }
  
  private saveDatabase() {
    try {
      if (!this.db) return;
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  private initDatabase() {
    if (!this.db) return;
    // 创建事件表（只存储SE和RP）
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date INTEGER NOT NULL,
        timeSlot TEXT NOT NULL,
        tag TEXT NOT NULL,
        customTag TEXT,
        recurrence TEXT NOT NULL,
        customRecurrence INTEGER,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        excludedDates TEXT,
        recurrenceEndDate INTEGER
      );
      
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_events_recurrence ON events(recurrence);
    `);
  }

  // 获取所有事件（只返回SE和RP）
  getAllEvents(): Event[] {
    if (!this.db) return [];
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const stmt = this.db.prepare('SELECT * FROM events');
    const rows: EventRow[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as EventRow);
    }
    stmt.free();
    return rows.map(row => this.rowToEvent(row));
  }

  // 添加事件
  addEvent(event: Event): void {
    if (!this.db) return;
    const row = this.eventToRow(event);
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const stmt = this.db.prepare(this.INSERT_EVENT_SQL);
    
    stmt.bind(row);
    stmt.step();
    stmt.free();
    this.saveDatabase();
  }

  // 更新事件
  updateEvent(event: Event): void {
    if (!this.db) return;
    const row = this.eventToRow(event);
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const stmt = this.db.prepare(`
      UPDATE events SET
        title = $title,
        description = $description,
        date = $date,
        timeSlot = $timeSlot,
        tag = $tag,
        customTag = $customTag,
        recurrence = $recurrence,
        customRecurrence = $customRecurrence,
        updatedAt = $updatedAt,
        excludedDates = $excludedDates,
        recurrenceEndDate = $recurrenceEndDate
      WHERE id = $id
    `);
    
    stmt.bind(row);
    stmt.step();
    stmt.free();
    this.saveDatabase();
  }

  // 删除事件
  deleteEvent(id: string): void {
    if (!this.db) return;
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const stmt = this.db.prepare('DELETE FROM events WHERE id = $id');
    stmt.bind({ $id: id });
    stmt.step();
    stmt.free();
    this.saveDatabase();
  }

  // 批量更新事件（用于同步）
  syncEvents(events: Event[]): void {
    if (!this.db) return;
    // 删除所有事件
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    this.db.run('DELETE FROM events');
    
    // 插入新事件
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const stmt = this.db.prepare(this.INSERT_EVENT_SQL);
    
    for (const event of events) {
      // 只存储SE和RP，跳过VI
      if (!event.parentId) {
        const row = this.eventToRow(event);
        stmt.bind(row);
        stmt.step();
        stmt.reset();
      }
    }
    
    stmt.free();
    this.saveDatabase();
  }

  // 转换行数据为Event对象
  private rowToEvent(row: EventRow): Event {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      date: new Date(row.date),
      timeSlot: row.timeSlot,
      tag: row.tag as 'private' | 'work' | 'balance' | 'custom',
      customTag: row.customTag || undefined,
      recurrence: row.recurrence as 'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
      customRecurrence: row.customRecurrence || undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      excludedDates: row.excludedDates ? JSON.parse(row.excludedDates).map((d: number) => new Date(d)) : undefined,
      recurrenceEndDate: row.recurrenceEndDate ? new Date(row.recurrenceEndDate) : undefined
    };
  }

  // 转换Event对象为行数据
  private eventToRow(event: Event): EventParams {
    // 确保日期是Date对象
    const ensureDate = (date: Date | string | number | undefined) => {
      if (date instanceof Date) return date;
      if (typeof date === 'string' || typeof date === 'number') return new Date(date);
      return new Date();
    };
    
    return {
      $id: event.id,
      $title: event.title,
      $description: event.description || null,
      $date: ensureDate(event.date).getTime(),
      $timeSlot: event.timeSlot,
      $tag: event.tag,
      $customTag: event.customTag || null,
      $recurrence: event.recurrence,
      $customRecurrence: event.customRecurrence || null,
      $createdAt: ensureDate(event.createdAt).getTime(),
      $updatedAt: ensureDate(event.updatedAt).getTime(),
      $excludedDates: event.excludedDates ? JSON.stringify(event.excludedDates.map(d => ensureDate(d).getTime())) : null,
      $recurrenceEndDate: event.recurrenceEndDate ? ensureDate(event.recurrenceEndDate).getTime() : null
    };
  }

  close(): void {
    if (!this.db) return;
    this.saveDatabase();
    this.db.close();
  }
}

export default EventDatabase;