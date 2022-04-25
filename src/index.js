const fs = require('fs')
const util = require('util')
const path = require('path')
const color = require('ansi-colors')
const adjustViewportsWithStats = require('./adjustViewportsWithStats')
const getStats = require('./getStats')
const browse = require('./browse')
const logger = require('./logger')
const skmeans = require('skmeans')

const writeFile = util.promisify(fs.writeFile)

const defaultOptions = {
  url: null,
  selector: 'img',
  statsFile: null,
  variationsFile: null,
  minViewport: null,
  maxViewport: null,
  delay: 5,
  verbose: false,
  basePath: process.cwd(),
  widthsNumber: 5,
  widthsDivisor: 10,
}

module.exports = async function main(settings) {
  const options = Object.assign({}, defaultOptions, settings)

  logger.level = options.verbose ? 'info' : 'warn'

  logger.info(
    color.bgCyan.black(
      '\nStep 1: get actual stats (viewports & screen densities) of site visitors',
    ),
  )
  let stats = getStats(
    path.resolve(options.basePath, options.statsFile),
    options,
  )
  Object.assign(options, adjustViewportsWithStats(stats, options))

  /* ======================================================================== */
  logger.info(
    color.bgCyan.black(
      '\nStep 2: get variations of image width across viewport widths',
    ),
  )

  const imageWidths = await browse(options)

  /* ======================================================================== */
  logger.info(
    color.bgCyan.black('\nStep 3: compute optimal n widths from both datasets'),
  )

  logger.info(color.green('Compute all perfect image widths'))

  let perfectWidths = new Map()
  let totalViews = 0
  stats.map((value) => {
    if (
      value.viewport >= options.minViewport &&
      value.viewport <= options.maxViewport
    ) {
      let perfectWidth = Math.ceil(
        imageWidths.get(value.viewport) * value.density,
      )
      let roundedPerfectWidth =
        perfectWidth - (perfectWidth % options.widthsDivisor)
      perfectWidths.set(
        roundedPerfectWidth,
        (perfectWidths.get(roundedPerfectWidth) || 0) + value.views,
      )
      totalViews += value.views
    }
  })
  // Change views numbers to percentages
  perfectWidths.forEach((views, width) => {
    perfectWidths.set(width, views / totalViews)
  })
  // sort by decreasing percentages
  perfectWidths = new Map(
    [...perfectWidths.entries()].sort((a, b) => {
      if (a[1] == b[1]) {
        // same percentage, sort by image width
        return b[0] - a[0]
      }
      return b[1] - a[1]
    }),
  )

  logger.info(
    color.green(`${perfectWidths.size} perfect widths have been computed`),
  )
  const perfectWidthsTable = logger.newTable({
    head: ['percentage', 'image width'],
    colAligns: ['right', 'right'],
    style: {
      head: ['green', 'green'],
      compact: true,
    },
  })
  if (perfectWidthsTable) {
    perfectWidths.forEach((percentage, imageWidth) => {
      let roundedPercentage = percentage * 100
      perfectWidthsTable.push([
        roundedPercentage.toFixed(2) + ' %',
        imageWidth + 'px',
      ])
    })
    logger.info(perfectWidthsTable.toString())
  }

  logger.info(color.green(`Find ${options.widthsNumber} best widths`))

  let closestRealWidths = []
  // Use the k-means algorithm to find the centroids of widths distribution,
  // with the k-means++ cluster initialization method
  const result = skmeans(
    [...perfectWidths.entries()],
    options.widthsNumber,
    'kmpp',
  )
  console.dir(result)
  result.centroids.forEach((centroid) => {
    const centroidWidth = centroid[0]
    closestRealWidths.push(
      [...perfectWidths.keys()].reduce((prev, curr) => {
        return Math.abs(prev - centroidWidth) > Math.abs(curr - centroidWidth)
          ? curr
          : prev
      }),
    )
  })
  closestRealWidths.sort().slice(0, options.widthsNumber)

  /* -------------------------- */

  let srcset = []
  closestRealWidths.forEach((width) => {
    srcset.push(`your/image/path.ext ${width}w`)
  })

  if (options.verbose) {
    console.dir(srcset)
  }

  // Save data into the TXT file
  if (options.destFile) {
    let fileString = `
page             : ${options.url}
image selector   : ${options.selector}
widths in srcset :
srcset="
  ${srcset.join(',\n')}"`

    await writeFile(
      path.resolve(options.basePath, options.destFile),
      fileString,
    )
      .then(() => {
        logger.info(color.green(`Data saved to file ${options.destFile}`))
      })
      .catch((error) =>
        logger.error(
          `Couldn’t save data to file ${options.destFile}:\n${error}`,
        ),
      )
  }

  return perfectWidths
}
