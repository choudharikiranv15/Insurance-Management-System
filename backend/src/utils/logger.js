const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFilePath = process.env.LOG_FILE_PATH || './logs';
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logFilePath)) {
      fs.mkdirSync(this.logFilePath, { recursive: true });
    }
  }

  getLogFileName(type = 'app') {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logFilePath, `${type}-${date}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    try {
      fs.appendFileSync(filename, content);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);

    // Console output
    console.log(formattedMessage.trim());

    // File output
    this.writeToFile(this.getLogFileName(), formattedMessage);

    // Error logs go to separate file
    if (level === 'error') {
      this.writeToFile(this.getLogFileName('error'), formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // HTTP request logger
  logRequest(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id || null
    };

    this.info('HTTP Request', meta);
  }

  // Database operation logger
  logDatabase(operation, collection, query = {}, result = {}) {
    const meta = {
      operation,
      collection,
      query: JSON.stringify(query),
      resultCount: result.length || (result.acknowledged ? 1 : 0)
    };

    this.debug('Database Operation', meta);
  }

  // Authentication logger
  logAuth(action, userId, success, meta = {}) {
    const logMeta = {
      action,
      userId,
      success,
      ...meta
    };

    this.info('Authentication Event', logMeta);
  }

  // Security event logger
  logSecurity(event, severity, meta = {}) {
    const logMeta = {
      event,
      severity,
      ...meta
    };

    if (severity === 'high') {
      this.error('Security Event', logMeta);
    } else {
      this.warn('Security Event', logMeta);
    }
  }

  // Business logic logger
  logBusiness(action, entity, entityId, meta = {}) {
    const logMeta = {
      action,
      entity,
      entityId,
      ...meta
    };

    this.info('Business Action', logMeta);
  }

  // Performance logger
  logPerformance(operation, duration, meta = {}) {
    const logMeta = {
      operation,
      duration: `${duration}ms`,
      ...meta
    };

    if (duration > 1000) {
      this.warn('Slow Operation', logMeta);
    } else {
      this.debug('Performance', logMeta);
    }
  }

  // Email logger
  logEmail(to, subject, status, meta = {}) {
    const logMeta = {
      to,
      subject,
      status,
      ...meta
    };

    this.info('Email Event', logMeta);
  }

  // File operation logger
  logFile(operation, filename, size, meta = {}) {
    const logMeta = {
      operation,
      filename,
      size: size ? `${size} bytes` : null,
      ...meta
    };

    this.info('File Operation', logMeta);
  }

  // Payment logger
  logPayment(action, paymentId, amount, status, meta = {}) {
    const logMeta = {
      action,
      paymentId,
      amount,
      status,
      ...meta
    };

    this.info('Payment Event', logMeta);
  }

  // Claim logger
  logClaim(action, claimId, amount, status, meta = {}) {
    const logMeta = {
      action,
      claimId,
      amount,
      status,
      ...meta
    };

    this.info('Claim Event', logMeta);
  }

  // Policy logger
  logPolicy(action, policyId, policyType, meta = {}) {
    const logMeta = {
      action,
      policyId,
      policyType,
      ...meta
    };

    this.info('Policy Event', logMeta);
  }
}

// Create and export singleton instance
const logger = new Logger();

module.exports = logger;