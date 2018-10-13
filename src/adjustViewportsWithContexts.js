const color = require('ansi-colors')
const logger = require('./logger')

module.exports = function adjustViewportsWithContexts(contexts, opt) {
  const contextMinViewport = contexts.reduce(
    (min, p) => (p.viewport < min ? p.viewport : min),
    contexts[0].viewport,
  )
  const contextMaxViewport = contexts.reduce(
    (max, p) => (p.viewport > max ? p.viewport : max),
    contexts[0].viewport,
  )
  logger.info(
    color.green(
      `Viewports in context go from ${contextMinViewport}px to ${contextMaxViewport}px`,
    ),
  )
  const result = {
    minViewport: contextMinViewport,
    maxViewport: contextMaxViewport,
  }

  if (opt.minViewport) {
    result.minViewport = Math.max(contextMinViewport, opt.minViewport)
  }
  if (opt.maxViewport) {
    result.maxViewport = Math.min(contextMaxViewport, opt.maxViewport)
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
