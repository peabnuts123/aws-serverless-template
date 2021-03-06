/* eslint-disable no-console */

// Enum for log level verbosity
export enum LogLevel {
  normal = 'Log_Level_Normal',
  debug = 'Log_Level_Debug',
  none = 'Log_Level_None',
}

// Singleton for managing logging
export default class Logger {
  private static currentLogLevel: LogLevel = LogLevel.normal;

  private constructor() { }

  /**
   * Set the current log level
   *
   * @param newLogLevel New log level
   */
  public static setLogLevel(newLogLevel: LogLevel): void {
    this.currentLogLevel = newLogLevel;
  }

  /**
   * Test whether the specified log level will log under the
   * current circumstances.
   *
   * @param level Log level to test
   */
  public static testLevel(level: LogLevel): boolean {
    switch (level) {
      case LogLevel.normal:
        // Normal can be printed in `normal` and `debug` log levels
        return this.currentLogLevel === LogLevel.normal || this.currentLogLevel === LogLevel.debug;
      case LogLevel.debug:
        // Debug can only be printed at `debug`
        return this.currentLogLevel === LogLevel.debug;
      case LogLevel.none:
        // None can NEVER be printed
        return false;
    }
  }

  /**
   * Log some things using `console.log` at the specified log level.
   * @param level LogLevel for this log
   * @param restObjects Things to log
   */
  public static log(level: LogLevel, ...restObjects: any[]): void;
  /**
   * Log some things using `console.log` at the default log level.
   * @param restObjects Things to log
   */
  public static log(...restObjects: any[]): void;
  public static log(logLevelOrObject: LogLevel | any, ...maybeRestObjects: any[]): void {
    this.performLog(console.log, logLevelOrObject, maybeRestObjects);
  }

  /**
   * Log some things using `console.warn` at the specified log level.
   * @param level LogLevel for this log
   * @param restObjects Things to log
   */
  public static logWarning(level: LogLevel, ...restObjects: any[]): void;
  /**
   * Log some things using `console.warn` at the default log level.
   * @param restObjects Things to log
   */
  public static logWarning(...restObjects: any[]): void;
  public static logWarning(logLevelOrObject: LogLevel | any, ...maybeRestObjects: any[]): void {
    this.performLog(console.warn, logLevelOrObject, maybeRestObjects);
  }

  /**
   * Log some things using `console.error` at the specified log level.
   * @param level LogLevel for this log
   * @param restObjects Things to log
   */
  public static logError(level: LogLevel, ...restObjects: any[]): void;
  /**
   * Log some things using `console.error` at the default log level.
   * @param restObjects Things to log
   */
  public static logError(...restObjects: any[]): void;
  public static logError(logLevelOrObject: LogLevel | any, ...maybeRestObjects: any[]): void {
    this.performLog(console.error, logLevelOrObject, maybeRestObjects);
  }

  /**
   * Test whether an object is a valid value from enum `LogLevel`.
   * Mostly around from JS times where you could pass the right string value,
   * and things would still work.
   *
   * @param object Object to test
   */
  private static isLogLevel(object: any): object is LogLevel {
    return Object.values(LogLevel).includes(object);
  }

  /**
   * Core logging function. Is responsible for resolving the crazy method overloads above.
   * Lots of weird type checking. It is weird because you can call it in so many ways.
   *
   * Will only call the logging function if the current log level is above or equal to
   * the requested log level (defaults to LogLevel.normal if not supplied).
   *
   * @param logFunction Logging function to call (e.g. `console.log`)
   * @param maybeLogLevelOrObject Either a log level, something to print, or nothing
   * @param restObjects Array of other objects to print
   */
  private static performLog(logFunction: (...args: any[]) => void, maybeLogLevelOrObject: LogLevel | any | undefined, restObjects: any[]): void {
    // Collection of things to print
    const values = [];
    // Log level - whether to print or not
    let logLevel = LogLevel.normal;

    // First param is either a log level, something to log, or nothing
    if (this.isLogLevel(maybeLogLevelOrObject)) {
      logLevel = maybeLogLevelOrObject;
    } else if (maybeLogLevelOrObject) {
      values.push(maybeLogLevelOrObject);
    }

    // Third param is always a rest param of things to print
    values.push(...restObjects);

    // Test whether we can print at all
    if (this.testLevel(logLevel)) {
      logFunction(`${logLevel === LogLevel.debug ? '[DEBUG]' : ''} ` + values.join(' '));
    }
  }
}
