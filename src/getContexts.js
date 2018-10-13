const csvparse = require('csv-parse/lib/sync')
const fs = require('fs')
const color = require('ansi-colors')
const logger = require('./logger')

module.exports = function getContext(csvFile, opt) {
  // Load content from the CSV file
  const contextsCsv = fs.readFileSync(csvFile, 'utf8')
  const csvHasHeader = contextsCsv.match(/[a-zA-Z]/)

  // Transform CSV into an array
  const result = csvparse(contextsCsv, {
    columns: ['viewport', 'density', 'views'],
    from: csvHasHeader ? 2 : 1,
    cast: function(value, context) {
      if (context.column == 'density') {
        return parseFloat(value)
      } else {
        return parseInt(value, 10)
      }
    },
  })

  logger.info(color.green(`Imported ${result.length} lines of context`))

  return result
}
