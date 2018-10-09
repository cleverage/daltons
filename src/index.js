const fs = require('fs')
const util = require('util')
const path = require('path')
const puppeteer = require('puppeteer')
const color = require('ansi-colors')
const Table = require('cli-table')
const adjustViewportsWithContexts = require('./adjustViewportsWithContexts')
const getContexts = require('./getContexts')

const writeFile = util.promisify(fs.writeFile)

const sleep = timeout => new Promise(r => setTimeout(r, timeout))

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

  if (options.verbose) {
    console.log(
      color.bgCyan.black(
        '\nStep 1: get actual contexts (viewports & screen densities) of site visitors',
      ),
    )
  }
  let contexts = getContexts(
    path.resolve(options.basePath, options.contextsFile),
    options,
  )
  Object.assign(options, adjustViewportsWithContexts(contexts, options))

  /* ======================================================================== */
  if (options.verbose) {
    console.log(
      color.bgCyan.black(
        '\nStep 2: get variations of image width across viewport widths',
      ),
    )
  }

  const VIEWPORT = {
    width: options.minViewport,
    height: 2000,
    deviceScaleFactor: 1,
  }
  const imageWidths = new Map()
  if (options.verbose) {
    console.log(color.green('Launch headless Chrome'))
  }
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  if (options.verbose) {
    console.log(color.green(`Go to ${options.url}`))
  }
  await page
    .goto(options.url, { waitUntil: 'networkidle2' })
    .then(async () => {
      if (options.verbose) {
        console.log(
          color.green(
            `Checking widths of image ${color.white(options.selector)}`,
          ),
        )
        process.stdout.write(
          `Current viewport: ${color.cyan(VIEWPORT.width)}px`,
        )
      }
      while (VIEWPORT.width <= options.maxViewport) {
        // Set new viewport width
        await page.setViewport(VIEWPORT)

        // Give the browser some time to adjust layout, sometimes requiring JS
        await sleep(options.delay)

        // Check image width
        let imageWidth = await page.evaluate(sel => {
          return document.querySelector(sel).width
        }, options.selector)
        imageWidths.set(VIEWPORT.width, imageWidth)

        // Increment viewport width
        VIEWPORT.width++

        // Update log in the console
        if (options.verbose) {
          process.stdout.clearLine()
          process.stdout.cursorTo(0)
          if (VIEWPORT.width <= options.maxViewport) {
            process.stdout.write(
              `Current viewport: ${color.cyan(VIEWPORT.width)}px`,
            )
          }
        }
      }

      // Save data into the CSV file
      if (options.variationsFile) {
        let csvString = 'viewport width (px);image width (px)\n'
        imageWidths.forEach(
          (imageWidth, viewportWidth) =>
            (csvString += `${viewportWidth};${imageWidth}` + '\n'),
        )
        await writeFile(
          path.resolve(options.basePath, options.variationsFile),
          csvString,
        )
          .then(() => {
            if (options.verbose) {
              console.log(
                color.green(
                  `Image width variations saved to CSV file ${
                    options.variationsFile
                  }`,
                ),
              )
            }
          })
          .catch(error =>
            console.log(
              color.red(
                `Couldn’t save image width variations to CSV file ${
                  options.variationsFile
                }:\n${error}`,
              ),
            ),
          )
      }

      // Output clean table to the console
      if (options.verbose) {
        const imageWidthsTable = new Table({
          head: ['viewport width', 'image width'],
          colAligns: ['right', 'right'],
          style: {
            head: ['green', 'green'],
            compact: true,
          },
        })
        imageWidths.forEach((imageWidth, viewportWidth) =>
          imageWidthsTable.push([viewportWidth + 'px', imageWidth + 'px']),
        )
        console.log(imageWidthsTable.toString())
      }
    })
    .catch(error =>
      console.log(
        color.red(`Couldn’t load page located at ${options.url}:\n${error}`),
      ),
    )

  await page.browser().close()

  /* ======================================================================== */
  if (options.verbose) {
    console.log(
      color.bgCyan.black(
        '\nStep 3: compute optimal n widths from both datasets',
      ),
    )
  }

  if (options.verbose) {
    console.log(color.green('Compute all perfect image widths'))
  }
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
  if (options.verbose) {
    console.log(
      color.green(`${perfectWidths.size} perfect widths have been computed`),
    )
    const perfectWidthsTable = new Table({
      head: ['percentage', 'image width'],
      colAligns: ['right', 'right'],
      style: {
        head: ['green', 'green'],
        compact: true,
      },
    })
    perfectWidths.forEach((percentage, imageWidth) => {
      let roundedPercentage = percentage * 100
      perfectWidthsTable.push([
        roundedPercentage.toFixed(2) + ' %',
        imageWidth + 'px',
      ])
    })
    console.log(perfectWidthsTable.toString())
  }

  if (options.verbose) {
    console.log(color.green(`Find ${options.widthsNumber} best widths`))
  }
  // todo
  let srcset = []

  if (options.verbose) {
    console.dir(srcset)
  }

  // Save data into the CSV file
  if (options.destfile) {
    let fileString = `
page           : ${options.url}
image selector : ${options.selector}
widths in srcset: ${srcset.join(',')}`
    await writeFile(
      path.resolve(options.basePath, options.destfile),
      fileString,
    )
      .then(() => {
        if (options.verbose) {
          console.log(color.green(`Data saved to file ${options.destfile}`))
        }
      })
      .catch(error =>
        console.log(
          color.red(
            `Couldn’t save data to file ${options.destfile}:\n${error}`,
          ),
        ),
      )
  }

  return perfectWidths
}
