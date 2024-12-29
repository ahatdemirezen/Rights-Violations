import {  createLogger, format, transports } from 'winston';

export const loggerForLogin = createLogger({
  level: 'info',

format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/login.log',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
      )
    })  
  ],
})