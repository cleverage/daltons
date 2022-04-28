const fs = require('fs')
const util = require('util')
const path = require('path')
const color = require('ansi-colors')
const adjustViewportsWithStats = require('./adjustViewportsWithStats')
const getStats = require('./getStats')
const browse = require('./browse')
const logger = require('./logger')

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
    color.bgGreen.black(
      '\n Step 1: get actual stats (viewports & screen densities) of site visitors '.padEnd(
        100,
      ) + '\n',
    ),
  )
  let stats = getStats(
    path.resolve(options.basePath, options.statsFile),
    options,
  )
  Object.assign(options, adjustViewportsWithStats(stats, options))

  /* ======================================================================== */
  logger.info(
    color.bgGreen.black(
      '\n Step 2: get variations of image width across viewport widths '.padEnd(
        100,
      ) + '\n',
    ),
  )

  const imageWidths = await browse(options)

  /* ======================================================================== */
  logger.info(
    color.bgGreen.black(
      '\n Step 3: compute optimal n widths from both datasets '.padEnd(100) +
        '\n',
    ),
  )

  logger.info(
    color.bgBlack.greenBright.underline(
      '\n Step 3.1: Compute all perfect image widths '.padEnd(100) + '\n',
    ),
  )

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
      let roundedPerfectWidth = perfectWidth
      if (perfectWidth % options.widthsDivisor !== 0) {
        roundedPerfectWidth =
          perfectWidth +
          (options.widthsDivisor - (perfectWidth % options.widthsDivisor))
      }
      perfectWidths.set(
        roundedPerfectWidth,
        (perfectWidths.get(roundedPerfectWidth) || 0) + value.views,
      )
      totalViews += value.views
    }
  })
  let numberOfPerfectWidths = perfectWidths.size
  logger.info(
    `${color.green(
      numberOfPerfectWidths + ' perfect widths',
    )} have been computed`,
  )

  // sort by decreasing views
  let perfectWidthsByDecreasingViews = new Map(
    [...perfectWidths.entries()].sort((a, b) => {
      if (a[1] === b[1]) {
        // same number of views, sort by image width
        return b[0] - a[0]
      }
      return b[1] - a[1]
    }),
  )

  const perfectWidthsTableByViews = logger.newTable({
    head: ['views', 'percentage', 'image width'],
    colAligns: ['right', 'right', 'right'],
    style: {
      head: ['green', 'green', 'green'],
      compact: true,
    },
  })
  if (perfectWidthsTableByViews) {
    let perfectWidthsTableByViewsLine = 1
    perfectWidthsByDecreasingViews.forEach((views, imageWidth) => {
      if (perfectWidthsTableByViewsLine <= 20) {
        let percentage = ((views / totalViews) * 100).toFixed(2) + ' %'
        perfectWidthsTableByViews.push([views, percentage, imageWidth + 'px'])
        perfectWidthsTableByViewsLine++
      }
    })
    if (perfectWidthsByDecreasingViews.size > 20) {
      perfectWidthsTableByViews.push(['…', '…', '…'])
    }
    logger.info('\nPerfect widths per decreasing views:')
    logger.info(perfectWidthsTableByViews.toString())
  }

  // sort by decreasing width
  let perfectWidthsByDecreasingWidths = new Map(
    [...perfectWidths.entries()].sort((a, b) => b[0] - a[0]),
  )

  // Show perfect widths per decreasing widths in the console only when there are 20 or less
  const perfectWidthsTableByWidths = logger.newTable({
    head: ['image width', 'views', 'percentage'],
    colAligns: ['right', 'right', 'right'],
    style: {
      head: ['green', 'green', 'green'],
      compact: true,
    },
  })
  if (perfectWidthsTableByWidths) {
    let perfectWidthsTableByWidthsLine = 1
    perfectWidthsByDecreasingWidths.forEach((views, imageWidth) => {
      if (perfectWidthsTableByWidthsLine <= 20) {
        let percentage = ((views / totalViews) * 100).toFixed(2) + ' %'
        perfectWidthsTableByWidths.push([imageWidth + 'px', views, percentage])
        perfectWidthsTableByWidthsLine++
      }
    })
    if (perfectWidthsByDecreasingWidths.size > 20) {
      perfectWidthsTableByViews.push(['…', '…', '…'])
    }
    logger.info('\nPerfect widths per decreasing widths:')
    logger.info(perfectWidthsTableByWidths.toString())
  }

  logger.info(
    color.bgBlack.greenBright.underline(
      `\n Step 3.2: Find ${options.widthsNumber} best image widths for srcset`.padEnd(
        100,
      ) + '\n',
    ),
  )

  let optimalWidths = []
  if (numberOfPerfectWidths <= options.widthsNumber) {
    // TODO: enhance this case
    logger.info(
      `There are already less than ${
        options.widthsNumber
      } best widths, ${color.green('no computation necessary')}`,
    )
    optimalWidths = perfectWidthsByDecreasingViews.values()
  } else {
    // Get all possible subset combinations in an array, with minimum and maximum lengths
    // Adapted from https://www.w3resource.com/javascript-exercises/javascript-function-exercise-21.php
    const subset = (items, min, max) => {
      let result_set = []
      let result

      for (var x = 0; x < Math.pow(2, items.length); x++) {
        result = []
        i = items.length - 1
        do {
          if ((x & (1 << i)) !== 0) {
            result.push(items[i])
          }
        } while (i--)

        if (result.length >= min && result.length <= max) {
          result_set.push(result)
        }
      }

      return result_set
    }

    // Keep only width values
    let widthValues = [...perfectWidthsByDecreasingWidths].map(
      (item) => item[0],
    )
    // Extract the maximum width, to keep it anyway
    let maxWidth = widthValues.shift()
    // Compute subset combinations of the other sizes, and add back the max width
    let subsets = subset(widthValues, 0, options.widthsNumber - 1).map((data) =>
      [maxWidth].concat(data.sort((a, b) => b - a)),
    )

    logger.info(
      `There are ${color.green(subsets.length + ' combinations')} to try`,
    )

    const globalDistance = (actualWidths, subset) => {
      let distance = 0
      // Adds a floor value to the subset
      let subsetCopy = [...subset, 0]
      // Loop through the subset
      for (let i = 0; i < subsetCopy.length - 1; i++) {
        // Loop each pixel width from current to next subset value
        for (let j = subsetCopy[i]; j > subsetCopy[i + 1]; j--) {
          // If there's such an actual width, add the distance
          if (actualWidths.get(j)) {
            let additionalDistance = (subsetCopy[i] - j) * actualWidths.get(j)
            distance += additionalDistance
          }
        }
      }
      return distance
    }

    // Compute the distance for each subset and keep the best one
    const spinner = logger.newSpinner()
    if (spinner) {
      spinner.start('Starting…')
    }

    const numberOfSubsets = subsets.length
    let bestSubsetDistance = -1
    let counter = 0
    subsets.map((subset) => {
      counter++
      if (spinner) {
        spinner.tick(
          `Computing distance for combination ${color.green(
            counter,
          )} on ${color.green(numberOfSubsets)}`,
        )
      }

      let distance = globalDistance(perfectWidthsByDecreasingWidths, subset)
      if (bestSubsetDistance === -1 || distance < bestSubsetDistance) {
        bestSubsetDistance = distance
        optimalWidths = subset
      }
    })
    if (spinner) {
      spinner.stop(
        `Computed distance for ${color.green(counter + ' combinations')}`,
      )
    }
  }

  /* -------------------------- */

  let srcset = []
  optimalWidths.forEach((width) => {
    srcset.push(`your/image/path.ext ${width}w`)
  })

  if (options.verbose) {
    console.log(
      `Here are the best image widths for the 'srcset' attribute:\n\n${srcset.join(
        ',\n',
      )}`,
    )
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

  return optimalWidths
}
