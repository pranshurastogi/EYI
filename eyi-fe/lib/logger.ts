/**
 * Production-ready logging utility for ENS integration
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const baseMessage = `[${timestamp}] [${level}] [ENS] ${message}`
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data, null, 2)}`
    }
    
    return baseMessage
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, data))
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, data))
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, data))
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorData = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : error
      
      console.error(this.formatMessage('ERROR', message, errorData))
    }
  }
}

// Create logger instance
export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
)

// ENS-specific logging functions
export const ensLogger = {
  connectionAttempt: (address: string) => {
    logger.info('ENS connection attempt', { address })
  },
  
  connectionSuccess: (address: string, ensName: string) => {
    logger.info('ENS connection successful', { address, ensName })
  },
  
  connectionFailed: (address: string, error: Error) => {
    logger.error('ENS connection failed', { address, error })
  },
  
  noENSFound: (address: string) => {
    logger.info('No ENS name found for address', { address })
  },
  
  popupShown: (address: string) => {
    logger.info('ENS registration popup shown', { address })
  },
  
  popupDismissed: (address: string, reason: string) => {
    logger.info('ENS registration popup dismissed', { address, reason })
  },
  
  popupRedirected: (address: string) => {
    logger.info('ENS registration popup redirected to ENS website', { address })
  },
  
  ringUpdate: (address: string, hasENS: boolean) => {
    logger.info('EYI ring updated with ENS status', { address, hasENS })
  }
}
