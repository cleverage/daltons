const color = require('ansi-colors')
const logger = require('./logger')

module.exports = function adjustDensitiesAndViewportsWithStats(stats, opt) {
  let result = {}

  // check screen densities
  const statsMinDensity = stats.reduce(
    (min, p) => (p.density < min ? p.density : min),
    stats[0].density,
  )
  const statsMaxDensity = stats.reduce(
    (max, p) => (p.density > max ? p.density : max),
    stats[0].density,
  )
  logger.info(
    `\nScreen densities in stats go from ${color.green(
      statsMinDensity,
    )} to ${color.green(statsMaxDensity)}`,
  )
  result.minDensity = statsMinDensity
  result.maxDensity = statsMaxDensity

  if (opt.minDensity || opt.maxDensity) {
    if (opt.minDensity) {
      result.minDensity = Math.max(statsMinDensity, opt.minDensity)
    }
    if (opt.maxDensity) {
      result.maxDensity = Math.min(statsMaxDensity, opt.maxDensity)
    }
    logger.info(
      `Screen densities will be limited from ${color.green(
        result.minDensity,
      )} to ${color.green(result.maxDensity)}`,
    )
  }

  // check viewports
  const statsMinViewport = stats.reduce(
    (min, p) => (p.viewport < min ? p.viewport : min),
    stats[0].viewport,
  )
  const statsMaxViewport = stats.reduce(
    (max, p) => (p.viewport > max ? p.viewport : max),
    stats[0].viewport,
  )
  logger.info(
    `\nViewports in stats go from ${color.green(
      statsMinViewport + 'px',
    )} to ${color.green(statsMaxViewport + 'px')}`,
  )
  result.minViewport = statsMinViewport
  result.maxViewport = statsMaxViewport

  if (opt.minViewport || opt.maxViewport) {
    if (opt.minViewport) {
      result.minViewport = Math.max(statsMinViewport, opt.minViewport)
    }
    if (opt.maxViewport) {
      result.maxViewport = Math.min(statsMaxViewport, opt.maxViewport)
    }
    logger.info(
      `Viewports will be limited from ${color.green(
        result.minViewport + 'px',
      )} to ${color.green(result.maxViewport + 'px')}`,
    )
  }

  return result
}
