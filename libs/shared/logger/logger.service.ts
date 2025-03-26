import { Injectable, LoggerService } from '@nestjs/common';
import * as path from 'path';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.initLWinstonLogger();
  }

  /**
   * Műveletek logolása
   *
   * @param {string} message üzenet mely logolásra kerül
   */
  log(message: string) {
    this.logger.info(message);
  }

  /**
   * Hiba üzenetek logolása
   *
   * @param {string} message üzenet mely logolásra kerül
   * @param {string} trace a hiba részletes információi
   */
  error(message: string, trace?: string) {
    this.logger.error(message, trace);
  }

  /**
   * Figyelmeztető üzenetek logolása
   *
   * @param {string} message üzenet mely logolásra kerül
   */
  warn(message: string) {
    this.logger.warn(message);
  }

  /**
   * Logger inicializálása
   */
  private initLWinstonLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} - ${level.toUpperCase()} - ${message}`;
        }),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new DailyRotateFile({
          filename: path.join('logs', '%DATE%.log'),
          datePattern: 'YYYY/MM/DD',
          zippedArchive: true,
          maxSize: '20m',
        }),
      ],
    });
  }
}
