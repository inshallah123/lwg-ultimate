"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class EventDatabase {
    constructor() {
        try {
            // 确保app已经准备好
            let userDataPath;
            try {
                userDataPath = electron_1.app.getPath('userData');
            }
            catch (error) {
                // 如果app还没准备好，使用默认路径
                userDataPath = electron_1.app.isPackaged
                    ? path.join(process.resourcesPath, '..')
                    : path.join(process.cwd(), 'userData');
            }
            // 确保目录存在
            if (!fs.existsSync(userDataPath)) {
                fs.mkdirSync(userDataPath, { recursive: true });
            }
            const dbPath = path.join(userDataPath, 'events.db');
            // 开发环境下输出数据库路径，方便调试
            if (!electron_1.app.isPackaged) {
                console.log('Database location:', dbPath);
            }
            this.db = new better_sqlite3_1.default(dbPath);
            this.initDatabase();
        }
        catch (error) {
            console.error('Error in EventDatabase constructor:', error);
            throw error;
        }
    }
    initDatabase() {
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
    getAllEvents() {
        const stmt = this.db.prepare('SELECT * FROM events');
        const rows = stmt.all();
        return rows.map(this.rowToEvent);
    }
    // 添加事件
    addEvent(event) {
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
    updateEvent(event) {
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
    deleteEvent(id) {
        const stmt = this.db.prepare('DELETE FROM events WHERE id = ?');
        stmt.run(id);
    }
    // 批量更新事件（用于同步）
    syncEvents(events) {
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
        const syncTransaction = this.db.transaction((events) => {
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
    rowToEvent(row) {
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
            excludedDates: row.excludedDates ? JSON.parse(row.excludedDates).map((d) => new Date(d)) : undefined,
            recurrenceEndDate: row.recurrenceEndDate ? new Date(row.recurrenceEndDate) : undefined
        };
    }
    // 转换Event对象为行数据
    eventToRow(event) {
        // 确保日期是Date对象
        const ensureDate = (date) => {
            if (date instanceof Date)
                return date;
            if (typeof date === 'string' || typeof date === 'number')
                return new Date(date);
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
    close() {
        this.db.close();
    }
}
exports.default = EventDatabase;
//# sourceMappingURL=database.js.map