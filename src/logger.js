const Table = require('cli-table')
const color = require('ansi-colors')
const Spinner = require('./spinner')

class Logger {
  constructor() {
    this.level = 'warn'
  }
  shouldLog(level) {
    return this.levels.indexOf(level) <= this.levels.indexOf(this.level)
  }
  run(level, msg) {
    if (!this.shouldLog(level)) {
      return
    }
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg)
    }
    console[level](msg)
  }
  log(msg) {
    this.run('log', msg)
  }
  info(msg) {
    this.run('info', msg)
  }
  warn(msg) {
    this.run('warn', msg)
  }
  error(msg) {
    this.run('error', color.red(msg))
  }
  newSpinner() {
    if (!this.shouldLog('info')) {
      return
    }
    return new Spinner()
  }
  newTable(cfg) {
    if (!this.shouldLog('info')) {
      return
    }
    return new Table(cfg)
  }
}

Logger.prototype.levels = ['error', 'warn', 'info', 'log']

const logger = new Logger()

module.exports = logger
