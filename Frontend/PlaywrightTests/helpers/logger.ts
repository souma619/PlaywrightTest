import fs from 'fs';
import path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const LOG_FILE = 'reports/logs/test-run.log';

// 🎨 Colors for console
const colors = {
  INFO: '\x1b[36m',   // Cyan
  WARN: '\x1b[33m',   // Yellow
  ERROR: '\x1b[31m',  // Red
  DEBUG: '\x1b[90m',  // Grey
  RESET: '\x1b[0m'
};

// ✅ Ensure log folder exists
function ensureLogDir() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ✅ Format log message
function formatMessage(level: LogLevel, message: string) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

// ✅ Write to file
function writeToFile(message: string) {
  ensureLogDir();
  fs.appendFileSync(LOG_FILE, message + '\n');
}

// ✅ Core logger
function log(level: LogLevel, message: string) {
  const formatted = formatMessage(level, message);

  // Console output (colored)
  console.log(`${colors[level]}${formatted}${colors.RESET}`);

  // File output
  writeToFile(formatted);
}

// ✅ Exported helpers
export const logger = {
  info: (msg: string) => log('INFO', msg),
  warn: (msg: string) => log('WARN', msg),
  error: (msg: string) => log('ERROR', msg),
  debug: (msg: string) => log('DEBUG', msg)
};