/**
 * 开发环境启动脚本
 * 自动检查并清理端口，然后启动Vite和Electron
 */
const { exec, spawn } = require('child_process');
const { platform } = require('os');

const PORT = 5173;

// 检查并杀死占用端口的进程
function killPort(port) {
  return new Promise((resolve) => {
    if (platform() === 'win32') {
      // Windows
      exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
        if (err || !stdout) {
          resolve();
          return;
        }
        
        const lines = stdout.split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        });
        
        if (pids.size > 0) {
          console.log(`正在关闭占用端口 ${port} 的进程...`);
          const pidList = Array.from(pids).join(' ');
          exec(`taskkill /F ${Array.from(pids).map(pid => `/PID ${pid}`).join(' ')}`, () => {
            setTimeout(resolve, 1000); // 等待1秒确保端口释放
          });
        } else {
          resolve();
        }
      });
    } else {
      // macOS/Linux
      exec(`lsof -ti:${port}`, (err, stdout) => {
        if (err || !stdout) {
          resolve();
          return;
        }
        
        const pids = stdout.trim().split('\n');
        if (pids.length > 0 && pids[0]) {
          console.log(`正在关闭占用端口 ${port} 的进程...`);
          exec(`kill -9 ${pids.join(' ')}`, () => {
            setTimeout(resolve, 1000);
          });
        } else {
          resolve();
        }
      });
    }
  });
}

// 启动开发服务器
async function startDev() {
  console.log('准备启动开发环境...');
  
  // 先清理端口
  await killPort(PORT);
  
  console.log('启动 Vite 和 Electron...');
  
  // 使用 concurrently 启动
  const child = spawn('npx', ['concurrently', '"npm:dev:vite"', '"npm:dev:electron"'], {
    shell: true,
    stdio: 'inherit'
  });
  
  child.on('exit', (code) => {
    process.exit(code);
  });
}

startDev().catch(console.error);