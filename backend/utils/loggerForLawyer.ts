import { createLogger, format, transports } from 'winston';

// Logger Oluşturma
export const loggerLawyer = createLogger({
  level: 'info', // Log seviyesi (info, error, warn vb.)

  // Format Ayarları
  format: format.combine(
    format.colorize(), // Renkli konsol çıktısı
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Tarih formatı
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),

  // Transports (Hedefler)
  transports: [
    // Konsola yazdır
    new transports.Console(),

    // Düz metin formatında dosyaya yazdır
    new transports.File({
      filename: 'logs/trylawyer.log',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
      )
    }),

    // JSON formatında dosyaya yazdır
    new transports.File({
      filename: 'logs/trylawyer.json',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
    
  ],
});
