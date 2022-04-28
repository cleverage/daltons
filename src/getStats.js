const csvparse = require('csv-parse/lib/sync')
const fs = require('fs')
const color = require('ansi-colors')
const logger = require('./logger')

module.exports = function getStats(csvFile, opt) {
  // Load content from the CSV file
  const statsCsv = fs.readFileSync(csvFile, 'utf8')
  const csvHasHeader = statsCsv.match(/[a-zA-Z]/)

  // Transform CSV into an array
  const result = csvparse(statsCsv, {
    columns: ['viewport', 'density', 'views'],
    from: csvHasHeader ? 2 : 1,
    cast: function (value, stats) {
      if (stats.column == 'density') {
        return parseFloat(value)
      } else {
        return parseInt(value, 10)
      }
    },
  })

  logger.info(`Imported ${color.green(result.length + ' lines')} of stats`)

  return result
}
