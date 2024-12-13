/**
 * Niveaux de log disponibles
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Configuration du logger
 */
interface LoggerConfig {
  /** Niveau minimum des logs à afficher */
  minLevel: LogLevel;
  /** Activer/désactiver les logs */
  enabled: boolean;
  /** Inclure la date dans les logs */
  includeTimestamp: boolean;
}

/**
 * Configuration par défaut
 */
const defaultConfig: LoggerConfig = {
  minLevel: 'info',
  enabled: process.env.NODE_ENV !== 'production',
  includeTimestamp: true,
};

/**
 * Ordre des niveaux de log
 */
const LOG_LEVELS: { [key in LogLevel]: number } = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Couleurs pour les différents niveaux de log
 */
const LOG_COLORS: { [key in LogLevel]: string } = {
  debug: '\x1b[34m', // Bleu
  info: '\x1b[32m',  // Vert
  warn: '\x1b[33m',  // Jaune
  error: '\x1b[31m', // Rouge
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Formatte un message de log
   */
  private format(level: LogLevel, message: string, data?: any): string {
    const parts = [];

    if (this.config.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`${LOG_COLORS[level]}[${level.toUpperCase()}]\x1b[0m`);
    parts.push(message);

    if (data) {
      parts.push(JSON.stringify(data, null, 2));
    }

    return parts.join(' ');
  }

  /**
   * Vérifie si un niveau de log doit être affiché
   */
  private shouldLog(level: LogLevel): boolean {
    return (
      this.config.enabled &&
      LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
    );
  }

  /**
   * Log un message de debug
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, data));
    }
  }

  /**
   * Log un message d'info
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, data));
    }
  }

  /**
   * Log un message d'avertissement
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, data));
    }
  }

  /**
   * Log un message d'erreur
   */
  error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, {
        message: error?.message,
        stack: error?.stack,
        ...error,
      }));
    }
  }
}

export const logger = new Logger();
