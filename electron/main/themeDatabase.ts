import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
const initSqlJs = require('sql.js');

interface SavedTheme {
  id?: number;
  name: string;
  config: any;
  createdAt: string;
  updatedAt: string;
}

class ThemeDatabase {
  private db: any;
  private dbPath: string = '';

  async initialize() {
    try {
      let userDataPath: string;
      try {
        userDataPath = app.getPath('userData');
      } catch (error) {
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
      
      const SQL = await initSqlJs({
        locateFile: (file: string) => path.join(__dirname, '../../../node_modules/sql.js/dist', file)
      });
      
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(data);
      } else {
        this.db = new SQL.Database();
      }
      
      this.initDatabase();
      this.saveDatabase();
      console.log('Theme database initialized successfully');
    } catch (error) {
      console.error('Error in ThemeDatabase initialization:', error);
      throw error;
    }
  }
  
  private saveDatabase() {
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
      console.error('Error saving theme database:', error);
    }
  }

  private initDatabase() {
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

  saveTheme(theme: SavedTheme): { success: boolean; error?: string } {
    try {
      // 检查是否已存在同名主题
      const checkStmt = this.db.prepare('SELECT id FROM themes WHERE name = $name');
      checkStmt.bind({ $name: theme.name });
      
      let existingId = null;
      if (checkStmt.step()) {
        existingId = checkStmt.getAsObject().id;
      }
      checkStmt.free();
      
      if (existingId) {
        // 更新现有主题
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
      return { success: true };
    } catch (error: any) {
      console.error('Error saving theme:', error);
      return { success: false, error: error.message };
    }
  }

  loadTheme(name: string): { success: boolean; theme?: SavedTheme; error?: string } {
    try {
      const stmt = this.db.prepare('SELECT * FROM themes WHERE name = $name');
      stmt.bind({ $name: name });
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        
        const theme: SavedTheme = {
          id: row.id,
          name: row.name,
          config: JSON.parse(row.config),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
        
        return { success: true, theme };
      }
      
      stmt.free();
      return { success: false, error: '主题不存在' };
    } catch (error: any) {
      console.error('Error loading theme:', error);
      return { success: false, error: error.message };
    }
  }

  getThemeList(): { success: boolean; themes?: SavedTheme[]; error?: string } {
    try {
      const stmt = this.db.prepare('SELECT * FROM themes ORDER BY updatedAt DESC');
      const themes: SavedTheme[] = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        themes.push({
          id: row.id,
          name: row.name,
          config: JSON.parse(row.config),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        });
      }
      
      stmt.free();
      return { success: true, themes };
    } catch (error: any) {
      console.error('Error getting theme list:', error);
      return { success: false, error: error.message };
    }
  }

  deleteTheme(name: string): { success: boolean; error?: string } {
    try {
      const stmt = this.db.prepare('DELETE FROM themes WHERE name = $name');
      stmt.bind({ $name: name });
      stmt.step();
      stmt.free();
      
      this.saveDatabase();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting theme:', error);
      return { success: false, error: error.message };
    }
  }

  close(): void {
    this.saveDatabase();
    this.db.close();
  }
}

export default ThemeDatabase;