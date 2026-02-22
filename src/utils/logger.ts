import fs from 'fs';
import path from 'path';

export type LogLevel = 'info' | 'error' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  details?: any;
}

class Logger {
  private logLevel: LogLevel;
  private logFilePath: string | null;
  private logRetentionDays: number = 90;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.logFilePath = process.env.LOG_FILE_PATH || null;

    // Create log directory if file logging is enabled
    if (this.logFilePath) {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['info', 'error', 'critical'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatLogEntry(entry: LogEntry): string {
    const detailsStr = entry.details ? ` | ${JSON.stringify(entry.details)}` : '';
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.component}] ${entry.message}${detailsStr}`;
  }

  private writeLog(entry: LogEntry): void {
    const formattedLog = this.formatLogEntry(entry);

    // Always write to console
    if (entry.level === 'error' || entry.level === 'critical') {
      console.error(formattedLog);
    } else {
      console.log(formattedLog);
    }

    // Write to file if configured
    if (this.logFilePath) {
      try {
        fs.appendFileSync(this.logFilePath, formattedLog + '\n', 'utf8');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  log(level: LogLevel, component: string, message: string, details?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      details,
    };

    this.writeLog(entry);
  }

  info(component: string, message: string, details?: any): void {
    this.log('info', component, message, details);
  }

  error(component: string, message: string, details?: any): void {
    this.log('error', component, message, details);
  }

  critical(component: string, message: string, details?: any): void {
    this.log('critical', component, message, details);
  }

  /**
   * Clean up old log files based on retention policy (90 days)
   */
  cleanupOldLogs(): void {
    if (!this.logFilePath) {
      return;
    }

    const logDir = path.dirname(this.logFilePath);
    const logFileName = path.basename(this.logFilePath);
    const logFileBase = logFileName.replace(/\.[^/.]+$/, '');
    const logFileExt = path.extname(logFileName);

    try {
      const files = fs.readdirSync(logDir);
      const now = Date.now();
      const retentionMs = this.logRetentionDays * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        // Check if file matches log file pattern
        if (file.startsWith(logFileBase)) {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtimeMs;

          if (fileAge > retentionMs) {
            fs.unlinkSync(filePath);
            this.info('Logger', `Deleted old log file: ${file}`, { age: Math.floor(fileAge / (24 * 60 * 60 * 1000)) + ' days' });
          }
        }
      });
    } catch (error) {
      this.error('Logger', 'Failed to cleanup old logs', { error });
    }
  }

  /**
   * Rotate log file by renaming current log with timestamp
   */
  rotateLog(): void {
    if (!this.logFilePath || !fs.existsSync(this.logFilePath)) {
      return;
    }

    try {
      const stats = fs.statSync(this.logFilePath);
      const fileSizeMB = stats.size / (1024 * 1024);

      // Rotate if file is larger than 10MB
      if (fileSizeMB > 10) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logDir = path.dirname(this.logFilePath);
        const logFileName = path.basename(this.logFilePath);
        const logFileBase = logFileName.replace(/\.[^/.]+$/, '');
        const logFileExt = path.extname(logFileName);
        const rotatedFileName = `${logFileBase}_${timestamp}${logFileExt}`;
        const rotatedFilePath = path.join(logDir, rotatedFileName);

        fs.renameSync(this.logFilePath, rotatedFilePath);
        this.info('Logger', `Rotated log file to: ${rotatedFileName}`, { sizeMB: fileSizeMB.toFixed(2) });
      }
    } catch (error) {
      this.error('Logger', 'Failed to rotate log file', { error });
    }
  }
}

// Export singleton instance
export const logger = new Logger();
