class Spinner {
  constructor() {
    this.hit = 0
  }
  tick(msg) {
    this.hit++
    this.clearLine()
    process.stdout.write(msg)
  }
  clearLine() {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
  }
  start(msg) {
    this.hit = 0
    process.stdout.write(msg)
  }
  stop(msg) {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    if (!msg) {
      return
    }
    process.stdout.write(msg + '\n')
  }
}

module.exports = Spinner
