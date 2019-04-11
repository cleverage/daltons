const color = require('ansi-colors')
const logger = require('./logger')

module.exports = function adjustViewportsWithStats(stats, opt) {
  const statsMinViewport = stats.reduce(
    (min, p) => (p.viewport < min ? p.viewport : min),
    stats[0].viewport,
  )
  const statsMaxViewport = stats.reduce(
    (max, p) => (p.viewport > max ? p.viewport : max),
    stats[0].viewport,
  )
  logger.info(
    color.green(
      `Viewports in stats go from ${statsMinViewport}px to ${statsMaxViewport}px`,
    ),
  )
  const result = {
    minViewport: statsMinViewport,
    maxViewport: statsMaxViewport,
  }

  if (opt.minViewport) {
    result.minViewport = Math.max(statsMinViewport, opt.minViewport)
  }
  if (opt.maxViewport) {
    result.maxViewport = Math.min(statsMaxViewport, opt.maxViewport)
  }

  logger.info(
    color.green(
      `Viewports will be considered from ${color.white(
        result.minViewport + 'px',
      )} to ${color.white(result.maxViewport + 'px')}`,
    ),
  )

  return result
}
