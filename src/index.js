#!/usr/bin/env node
/**
 * Choose optimal responsive image widths to put in your `srcset` attribute
 *
 * Usage:
 *
 *     npx responsive-image-widths -h
 */

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
  const imageWidths = []
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
      }
      while (VIEWPORT.width <= options.maxViewport) {
        if (options.verbose) {
          console.log(`Current viewport: ${color.cyan(VIEWPORT.width)}px`)
        }
        // Set new viewport width
        await page.setViewport(VIEWPORT)

        // Give the browser some time to adjust layout, sometimes requiring JS
        await sleep(options.delay)

        // Check image width
        let imageWidth = await page.evaluate(sel => {
          return document.querySelector(sel).width
        }, options.selector)
        imageWidths[VIEWPORT.width] = imageWidth

        // Increment viewport width
        VIEWPORT.width++
      }

      // Save data into the CSV file
      if (options.variationsFile) {
        let csvString = 'viewport width (px);image width (px)\n'
        imageWidths.map(
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
        imageWidths.map((imageWidth, viewportWidth) =>
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
  let perfectWidthsTemp = []
  let totalViews = 0
  contexts.map(value => {
    if (
      value.viewport >= options.minViewport &&
      value.viewport <= options.maxViewport
    ) {
      perfectWidth = Math.ceil(imageWidths[value.viewport] * value.density)
      if (perfectWidthsTemp[perfectWidth] === undefined) {
        perfectWidthsTemp[perfectWidth] = 0
      }
      perfectWidthsTemp[perfectWidth] += value.views
      totalViews += value.views
    }
  })
  // Change views numbers to percentages and create an array without holes
  let perfectWidths = []
  perfectWidthsTemp.map((value, index) => {
    perfectWidths.push({
      width: index,
      percentage: value / totalViews,
    })
  })
  if (options.verbose) {
    console.log(
      color.green(`${perfectWidths.length} perfect widths have been computed`),
    )
    console.dir(perfectWidths)
  }

  if (options.verbose) {
    console.log(color.green('Sort the array by percentage in decreasing order'))
  }
  perfectWidths.sort((a, b) => {
    return b.percentage - a.percentage
  })
  console.dir(perfectWidths)

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
}
