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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const initSqlJs = require('sql.js');
class ThemeDatabase {
    constructor() {
        this.db = null;
        this.dbPath = '';
    }
    async initialize() {
        try {
            let userDataPath;
            try {
                userDataPath = electron_1.app.getPath('userData');
            }
            catch (_error) {
                console.log('App not ready, using fallback path for themes');
                userDataPath = electron_1.app.isPackaged
                    ? path.join(process.resourcesPath, '..')
                    : path.join(process.cwd(), 'userData');
            }
            if (!fs.existsSync(userDataPath)) {
                fs.mkdirSync(userDataPath, { recursive: true });
            }
            this.dbPath = path.join(userDataPath, 'themes.db');
            console.log('Theme database location:', this.dbPath);
            const SQL = await initSqlJs({
                locateFile: (file) => path.join(__dirname, '../../../node_modules/sql.js/dist', file)
            });
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath);
                this.db = new SQL.Database(data);
            }
            else {
                this.db = new SQL.Database();
            }
            this.initDatabase();
            this.saveDatabase();
            console.log('Theme database initialized successfully');
        }
        catch (error) {
            console.error('Error in ThemeDatabase initialization:', error);
            throw error;
        }
    }
    saveDatabase() {
        try {
            if (!this.db)
                return;
            const data = this.db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(this.dbPath, buffer);
        }
        catch (error) {
            console.error('Error saving theme database:', error);
        }
    }
    initDatabase() {
        if (!this.db)
            return;
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
    saveTheme(theme) {
        try {
            if (!this.db)
                return { success: false, error: 'Database not initialized' };
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
            }
            else {
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
        }
        catch (error) {
            console.error('Error saving theme:', error);
            return { success: false, error: error.message };
        }
    }
    loadTheme(name) {
        try {
            if (!this.db)
                return { success: false, error: 'Database not initialized' };
            const stmt = this.db.prepare('SELECT * FROM themes WHERE name = $name');
            stmt.bind({ $name: name });
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                const theme = {
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
        }
        catch (error) {
            console.error('Error loading theme:', error);
            return { success: false, error: error.message };
        }
    }
    getThemeList() {
        try {
            if (!this.db)
                return { success: false, error: 'Database not initialized' };
            const stmt = this.db.prepare('SELECT * FROM themes ORDER BY updatedAt DESC');
            const themes = [];
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
        }
        catch (error) {
            console.error('Error getting theme list:', error);
            return { success: false, error: error.message };
        }
    }
    deleteTheme(name) {
        try {
            if (!this.db)
                return { success: false, error: 'Database not initialized' };
            const stmt = this.db.prepare('DELETE FROM themes WHERE name = $name');
            stmt.bind({ $name: name });
            stmt.step();
            stmt.free();
            this.saveDatabase();
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting theme:', error);
            return { success: false, error: error.message };
        }
    }
    close() {
        if (!this.db)
            return;
        this.saveDatabase();
        this.db.close();
    }
}
exports.default = ThemeDatabase;
//# sourceMappingURL=themeDatabase.js.map