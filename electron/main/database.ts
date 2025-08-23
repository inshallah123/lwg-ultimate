import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { Event } from '../../src/types/event';

class EventDatabase {
  private db: Database.Database;

  constructor() {
    try {
      // 确保app已经准备好
      let userDataPath: string;
      try {
        userDataPath = app.getPath('userData');
      } catch (error) {
        // 如果app还没准备好，使用默认路径
        userDataPath = app.isPackaged 
          ? path.join(process.resourcesPath, '..')
          : path.join(process.cwd(), 'userData');
      }
      
      // 确保目录存在
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
      
      const dbPath = path.join(userDataPath, 'events.db');
      
      // 开发环境下输出数据库路径，方便调试
      if (!app.isPackaged) {
        console.log('Database location:', dbPath);
      }
      
      this.db = new Database(dbPath);
      this.initDatabase();
    } catch (error) {
      console.error('Error in EventDatabase constructor:', error);
      throw error;
    }
  }

  private initDatabase() {
    // 创建事件表（只存储SE和RP）
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
    const stmt = this.db.prepare('SELECT * FROM events');
    const rows = stmt.all();
    return rows.map(this.rowToEvent);
  }

  // 添加事件
  addEvent(event: Event): void {
    const stmt = this.db.prepare(`
      INSERT INTO events (
        id, title, description, date, timeSlot, tag, customTag,
        recurrence, customRecurrence, createdAt, updatedAt,
        excludedDates, recurrenceEndDate
      ) VALUES (
        @id, @title, @description, @date, @timeSlot, @tag, @customTag,
        @recurrence, @customRecurrence, @createdAt, @updatedAt,
        @excludedDates, @recurrenceEndDate
      )
    `);
    
    stmt.run(this.eventToRow(event));
  }

  // 更新事件
  updateEvent(event: Event): void {
    const stmt = this.db.prepare(`
      UPDATE events SET
        title = @title,
        description = @description,
        date = @date,
        timeSlot = @timeSlot,
        tag = @tag,
        customTag = @customTag,
        recurrence = @recurrence,
        customRecurrence = @customRecurrence,
        updatedAt = @updatedAt,
        excludedDates = @excludedDates,
        recurrenceEndDate = @recurrenceEndDate
      WHERE id = @id
    `);
    
    stmt.run(this.eventToRow(event));
  }

  // 删除事件
  deleteEvent(id: string): void {
    const stmt = this.db.prepare('DELETE FROM events WHERE id = ?');
    stmt.run(id);
  }

  // 批量更新事件（用于同步）
  syncEvents(events: Event[]): void {
    const deleteAll = this.db.prepare('DELETE FROM events');
    const insert = this.db.prepare(`
      INSERT INTO events (
        id, title, description, date, timeSlot, tag, customTag,
        recurrence, customRecurrence, createdAt, updatedAt,
        excludedDates, recurrenceEndDate
      ) VALUES (
        @id, @title, @description, @date, @timeSlot, @tag, @customTag,
        @recurrence, @customRecurrence, @createdAt, @updatedAt,
        @excludedDates, @recurrenceEndDate
      )
    `);

    const syncTransaction = this.db.transaction((events: Event[]) => {
      deleteAll.run();
      for (const event of events) {
        // 只存储SE和RP，跳过VI
        if (!event.parentId) {
          insert.run(this.eventToRow(event));
        }
      }
    });

    syncTransaction(events);
  }

  // 转换行数据为Event对象
  private rowToEvent(row: any): Event {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      date: new Date(row.date),
      timeSlot: row.timeSlot,
      tag: row.tag,
      customTag: row.customTag || undefined,
      recurrence: row.recurrence,
      customRecurrence: row.customRecurrence || undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      excludedDates: row.excludedDates ? JSON.parse(row.excludedDates).map((d: number) => new Date(d)) : undefined,
      recurrenceEndDate: row.recurrenceEndDate ? new Date(row.recurrenceEndDate) : undefined
    };
  }

  // 转换Event对象为行数据
  private eventToRow(event: Event): any {
    // 确保日期是Date对象
    const ensureDate = (date: any) => {
      if (date instanceof Date) return date;
      if (typeof date === 'string' || typeof date === 'number') return new Date(date);
      return new Date();
    };
    
    return {
      id: event.id,
      title: event.title,
      description: event.description || null,
      date: ensureDate(event.date).getTime(),
      timeSlot: event.timeSlot,
      tag: event.tag,
      customTag: event.customTag || null,
      recurrence: event.recurrence,
      customRecurrence: event.customRecurrence || null,
      createdAt: ensureDate(event.createdAt).getTime(),
      updatedAt: ensureDate(event.updatedAt).getTime(),
      excludedDates: event.excludedDates ? JSON.stringify(event.excludedDates.map(d => ensureDate(d).getTime())) : null,
      recurrenceEndDate: event.recurrenceEndDate ? ensureDate(event.recurrenceEndDate).getTime() : null
    };
  }

  close(): void {
    this.db.close();
  }
}

export default EventDatabase;