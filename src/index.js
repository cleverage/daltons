const fs = require('fs')
const util = require('util')
const path = require('path')
const puppeteer = require('puppeteer')
const color = require('ansi-colors')
const adjustViewportsWithContexts = require('./adjustViewportsWithContexts')
const getContexts = require('./getContexts')
const browse = require('./browse')
const logger = require('./logger')

const writeFile = util.promisify(fs.writeFile)

const defaultOptions = {
  url: null,
  selector: 'img',
  contextsFile: null,
  variationsFile: null,
  minViewport: null,
  maxViewport: null,
  delay: 5,
  verbose: false,
  basePath: process.cwd(),
}

module.exports = async function main(settings) {
  const options = Object.assign({}, defaultOptions, settings)

  logger.level = options.verbose ? 'info' : 'warn'

  logger.info(
    color.bgCyan.black(
      '\nStep 1: get actual contexts (viewports & screen densities) of site visitors',
    ),
  )
  let contexts = getContexts(
    path.resolve(options.basePath, options.contextsFile),
    options,
  )
  Object.assign(options, adjustViewportsWithContexts(contexts, options))

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
  contexts.map(value => {
    if (
      value.viewport >= options.minViewport &&
      value.viewport <= options.maxViewport
    ) {
      perfectWidth = Math.ceil(imageWidths.get(value.viewport) * value.density)
      perfectWidths.set(
        perfectWidth,
        (perfectWidths.get(perfectWidth) || 0) + value.views,
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

  // todo
  let srcset = []

  if (options.verbose) {
    console.dir(srcset)
  }

  // Save data into the CSV file
  if (options.destFile) {
    let fileString = `
page           : ${options.url}
image selector : ${options.selector}
widths in srcset: ${srcset.join(',')}`
    await writeFile(
      path.resolve(options.basePath, options.destFile),
      fileString,
    )
      .then(() => {
        logger.info(color.green(`Data saved to file ${options.destFile}`))
      })
      .catch(error =>
        logger.error(
          `Couldn’t save data to file ${options.destFile}:\n${error}`,
        ),
      )
  }
}
