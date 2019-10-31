const puppeteer = require('puppeteer')
const color = require('ansi-colors')
const logger = require('./logger')

const sleep = timeout => new Promise(r => setTimeout(r, timeout))

module.exports = async function browse(opt) {
  const VIEWPORT = {
    width: opt.minViewport,
    height: 2000,
    deviceScaleFactor: 1,
  }
  const imageWidths = new Map()

  logger.info(color.green('Launch headless Chrome'))

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  logger.info(color.green(`Go to ${opt.url}`))

  await page
    .goto(opt.url, { waitUntil: 'networkidle2' })
    .then(async () => {
      logger.info(
        color.green(`Checking widths of image ${color.white(opt.selector)}`),
      )
      const spinner = logger.newSpinner()
      if (spinner) {
        spinner.start('Starting…')
      }

      while (VIEWPORT.width <= opt.maxViewport) {
        // Update log in the console
        if (spinner) {
          spinner.tick(`Current viewport: ${color.cyan(VIEWPORT.width)}px`)
        }
        // Set new viewport width
        await page.setViewport(VIEWPORT)

        // Give the browser some time to adjust layout, sometimes requiring JS
        await sleep(opt.delay)

        // Check image width
        let imageWidth = await page.evaluate(sel => {
          return document.querySelector(sel).width
        }, opt.selector)
        imageWidths.set(VIEWPORT.width, imageWidth)

        // Increment viewport width
        VIEWPORT.width++
      }

      if (spinner) {
        spinner.stop(`Finished at viewport: ${color.cyan(opt.maxViewport)}px`)
      }

      // Save data into the CSV file
      if (opt.variationsFile) {
        let csvString = 'viewport width (px);image width (px)\n'
        imageWidths.forEach(
          (imageWidth, viewportWidth) =>
            (csvString += `${viewportWidth};${imageWidth}` + '\n'),
        )
        await writeFile(
          path.resolve(opt.basePath, opt.variationsFile),
          csvString,
        )
          .then(() => {
            logger.info(
              color.green(
                `Image width variations saved to CSV file ${opt.variationsFile}`,
              ),
            )
          })
          .catch(error =>
            logger.error(
              `Couldn’t save image width variations to CSV file ${opt.variationsFile}:\n${error}`,
            ),
          )
      }

      // Output clean table to the console
      const imageWidthsTable = logger.newTable({
        head: ['viewport width', 'image width'],
        colAligns: ['right', 'right'],
        style: {
          head: ['green', 'green'],
          compact: true,
        },
      })
      if (imageWidthsTable) {
        imageWidths.forEach((imageWidth, viewportWidth) =>
          imageWidthsTable.push([viewportWidth + 'px', imageWidth + 'px']),
        )
        logger.info(imageWidthsTable.toString())
      }
    })
    .catch(error =>
      logger.error(`Couldn’t load page located at ${opt.url}:\n${error}`),
    )

  await page.browser().close()

  return imageWidths
}
