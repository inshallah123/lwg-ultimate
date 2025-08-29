import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { SQLiteDatabase, loadOrCreateDatabase } from './sqliteUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */
interface SavedTheme {
  id?: number;
  name: string;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

class ThemeDatabase {
  private db: SQLiteDatabase | null = null;
  private dbPath: string = '';

  async initialize() {
    // 保留初始化的错误处理，因为涉及文件I/O
    try {
      let userDataPath: string;
      try {
        userDataPath = app.getPath('userData');
      } catch {
        console.log('App not ready, using fallback path for themes');
        userDataPath = app.isPackaged 
          ? path.join(process.resourcesPath, '..')
          : path.join(process.cwd(), 'userData');
      }
      
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
      
      this.dbPath = path.join(userDataPath, 'themes.db');
      
      console.log('Theme database location:', this.dbPath);
      
      // 加载或创建数据库
      this.db = await loadOrCreateDatabase(this.dbPath);
      
      this.initDatabase();
      this.saveDatabase();
      console.log('Theme database initialized successfully');
    } catch (error) {
      console.error('Error in ThemeDatabase initialization:', error);
      throw error;
    }
  }
  
  private saveDatabase() {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  private initDatabase() {
    if (!this.db) return;
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        config TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(name);
    `);
  }

  saveTheme(theme: SavedTheme): boolean {
    if (!this.db) return false;
    
    // 检查是否已存在同名主题
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const checkStmt = this.db.prepare('SELECT id FROM themes WHERE name = $name');
    checkStmt.bind({ $name: theme.name });
    
    let existingId = null;
    if (checkStmt.step()) {
      existingId = checkStmt.getAsObject().id;
    }
    checkStmt.free();
    
    if (existingId) {
      // 更新现有主题
      //noinspection SqlDialectInspection,SqlNoDataSourceInspection
      const updateStmt = this.db.prepare(`
        UPDATE themes SET
          config = $config,
          updatedAt = $updatedAt
        WHERE id = $id
      `);
      
      updateStmt.bind({
        $id: existingId,
        $config: JSON.stringify(theme.config),
        $updatedAt: new Date().toISOString()
      });
      updateStmt.step();
      updateStmt.free();
    } else {
      // 插入新主题
        // noinspection SqlDialectInspection,SqlNoDataSourceInspection
        const insertStmt = this.db.prepare(`
        INSERT INTO themes (name, config, createdAt, updatedAt)
        VALUES ($name, $config, $createdAt, $updatedAt)
      `);
      
      insertStmt.bind({
        $name: theme.name,
        $config: JSON.stringify(theme.config),
        $createdAt: theme.createdAt || new Date().toISOString(),
        $updatedAt: theme.updatedAt || new Date().toISOString()
      });
      insertStmt.step();
      insertStmt.free();
    }
    
    this.saveDatabase();
    return true;
  }

  loadTheme(name: string): SavedTheme | null {
    if (!this.db) return null;
    
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const stmt = this.db.prepare('SELECT * FROM themes WHERE name = $name');
    stmt.bind({ $name: name });
    
    if (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, any>;
      stmt.free();
      
      return {
        id: row.id,
        name: row.name,
        config: JSON.parse(row.config),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };
    }
    
    stmt.free();
    return null;
  }

  getThemeList(): SavedTheme[] {
    if (!this.db) return [];
    
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const stmt = this.db.prepare('SELECT * FROM themes ORDER BY updatedAt DESC');
    const themes: SavedTheme[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, any>;
      themes.push({
        id: row.id,
        name: row.name,
        config: JSON.parse(row.config),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      });
    }
    
    stmt.free();
    return themes;
  }

  deleteTheme(name: string): boolean {
    if (!this.db) return false;
    
    //noinspection SqlDialectInspection,SqlNoDataSourceInspection
    const stmt = this.db.prepare('DELETE FROM themes WHERE name = $name');
    stmt.bind({ $name: name });
    stmt.step();
    stmt.free();
    
    this.saveDatabase();
    return true;
  }

  close(): void {
    if (!this.db) return;
    this.saveDatabase();
    this.db.close();
  }
}

export default ThemeDatabase;