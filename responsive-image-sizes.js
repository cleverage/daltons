/**
 * Get the CSS width of an image in a page at different viewport widths
 *
 * Usage:
 *
 *     node responsive-image-sizes.js -h
 */

const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)

const puppeteer = require('puppeteer')
const color = require('ansi-colors')
const table = require('cli-table')

const sleep = timeout => new Promise(r => setTimeout(r, timeout))

const argv = require('yargs')
  .options({
    contextsfile: {
      alias: 'c',
      describe:
        'File path from which reading the actual contexts data in CSV format (screen density in dppx, viewport width in px, number of page views)',
      demandOption: true,
      type: 'string',
    },
    url: {
      alias: 'u',
      describe: 'Page URL',
      demandOption: true,
    },
    selector: {
      alias: 's',
      describe: 'Image selector in the page',
      demandOption: true,
    },
    minviewport: {
      alias: 'i',
      describe: 'Minimum viewport width to check',
      default: 240,
      defaultDescription: '240: viewport width of some feature phones',
      type: 'number',
    },
    maxviewport: {
      alias: 'x',
      describe: 'Maximum viewport width to check',
      default: 1920,
      defaultDescription: '1920: full HD viewport width',
      type: 'number',
    },
    viewportstep: {
      alias: 'p',
      describe: 'Viewport width step',
      default: 1,
      type: 'number',
    },
    delay: {
      alias: 'd',
      describe:
        'Delay after viewport resizing before checking image width (ms)',
      default: 500,
      type: 'number',
    },
    variationsfile: {
      alias: 'a',
      describe:
        'File path to which saving the image width variations data, in CSV format',
      type: 'string',
    },
    widthsnumber: {
      alias: 'n',
      describe: 'Number of widths to recommend',
      default: 5,
      type: 'number',
    },
    destfile: {
      alias: 'f',
      describe:
        'File path to which saving the image widths for the srcset attribute',
      type: 'string',
    },
    verbose: {
      alias: 'v',
      describe: 'Log progress and result in the console',
    },
  })
  .group(['contextsfile'], 'Step 1: get actual contexts of site visitors')
  .group(
    [
      'url',
      'selector',
      'minviewport',
      'maxviewport',
      'viewportstep',
      'delay',
      'variationsfile',
    ],
    'Step 2: get variations of image size across viewport widths',
  )
  .group(
    ['widthsnumber', 'destfile'],
    'Step 3: compute optimal n sizes from both datasets',
  )
  .check(function(argv) {
    // waiting for https://github.com/yargs/yargs/issues/1079
    if (isNaN(argv.minviewport)) {
      throw new Error(
        color.red(`Error: ${color.redBright('minviewport')} must be a number`),
      )
    }
    if (argv.minviewport < 0) {
      throw new Error(
        color.red(`Error: ${color.redBright('minviewport')} must be >= 0`),
      )
    }
    if (isNaN(argv.maxviewport)) {
      throw new Error(
        color.red(`Error: ${color.redBright('maxviewport')} must be a number`),
      )
    }
    if (isNaN(argv.viewportstep)) {
      throw new Error(
        color.red(`Error: ${color.redBright('viewportstep')} must be a number`),
      )
    }
    if (argv.viewportstep < 1) {
      throw new Error(
        color.red(`Error: ${color.redBright('viewportstep')} must be >= 1`),
      )
    }
    if (isNaN(argv.delay)) {
      throw new Error(
        color.red(`Error: ${color.redBright('delay')} must be a number`),
      )
    }
    if (argv.delay < 0) {
      throw new Error(
        color.red(`Error: ${color.redBright('delay')} must be >= 0`),
      )
    }
    if (argv.maxviewport < argv.minviewport) {
      throw new Error(
        color.red(
          `Error: ${color.redBright(
            'maxviewport',
          )} must be greater than minviewport`,
        ),
      )
    }
    if (argv.variationsfile && fs.existsSync(argv.variationsfile)) {
      throw new Error(
        color.red(
          `Error: file ${argv.variationsfile} set with ${color.redBright(
            'variationsfile',
          )} already exists`,
        ),
      )
    }
    if (isNaN(argv.widthsnumber)) {
      throw new Error(
        color.red(`Error: ${color.redBright('widthsnumber')} must be a number`),
      )
    }
    if (argv.destfile && fs.existsSync(argv.destfile)) {
      throw new Error(
        color.red(
          `Error: file ${argv.destfile} set with ${color.redBright(
            'destfile',
          )} already exists`,
        ),
      )
    }
    if (!argv.destfile && !argv.verbose) {
      throw new Error(
        color.red(
          `Error: data should be either saved in a file (${color.redBright(
            'destfile',
          )} and/or output to the console (${color.redBright('verbose')}`,
        ),
      )
    }
    return true
  })
  .help()
  .example(
    "node $0 --contextsfile ./contexts.csv --url 'https://example.com/' --selector 'main img[srcset]:first-of-type' --verbose",
  )
  .example(
    "node $0 -c ./contexts.csv -u 'https://example.com/' -s 'main img[srcset]:first-of-type' -i 320 -x 1280 -a ./variations.csv -f ./srcset-widths.txt -v",
  )
  .wrap(null)
  .detectLocale(false).argv
;(async () => {
  /* ======================================================================== */
  if (argv.verbose) {
    console.log(
      color.bgCyan.black(
        '\nStep 1: get actual contexts (viewports & screen densities) of site visitors',
      ),
    )
  }

  // todo

  /* ======================================================================== */
  if (argv.verbose) {
    console.log(
      color.bgCyan.black(
        '\nStep 2: get variations of image size across viewport widths',
      ),
    )
  }

  const VIEWPORT = {
    width: argv.minviewport,
    height: 2000,
    deviceScaleFactor: 1,
  }
  const imageWidths = []
  if (argv.verbose) {
    console.log(color.green('Launch headless Chrome'))
  }
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  if (argv.verbose) {
    console.log(color.green(`Go to ${argv.url}`))
  }
  await page
    .goto(argv.url, { waitUntil: 'networkidle2' })
    .then(async () => {
      if (argv.verbose) {
        console.log(color.green(`Checking sizes of image ${argv.selector}`))
        process.stdout.write(
          `Current viewport: ${color.cyan(VIEWPORT.width)}px`,
        )
      }
      while (VIEWPORT.width <= argv.maxviewport) {
        // Set new viewport width
        await page.setViewport(VIEWPORT)

        // Give the browser some time to adjust layout, sometimes requiring JS
        await sleep(argv.delay)

        // Check image width
        let imageWidth = await page.evaluate(sel => {
          return document.querySelector(sel).width
        }, argv.selector)
        imageWidths.push([VIEWPORT.width, imageWidth])

        // Increment viewport width
        VIEWPORT.width += argv.viewportstep

        // Update log in the console
        if (argv.verbose) {
          process.stdout.clearLine()
          process.stdout.cursorTo(0)
          if (VIEWPORT.width <= argv.maxviewport) {
            process.stdout.write(
              `Current viewport: ${color.cyan(VIEWPORT.width)}px`,
            )
          }
        }
      }

      // Save data into the CSV file
      if (argv.variationsfile) {
        let csvString = 'viewport width (px);image width (px)\n'
        sizes.map(row => (csvString += `${row[0]};${row[1]}` + '\n'))
        await writeFile(argv.variationsfile, csvString)
          .then(() => {
            if (argv.verbose) {
              console.log(
                color.green(
                  `Image width variations saved to CSV file ${
                    argv.variationsfile
                  }`,
                ),
              )
            }
          })
          .catch(error =>
            console.log(
              color.red(
                `Couldn't save image width variations to CSV file ${
                  argv.variationsfile
                }:\n${error}`,
              ),
            ),
          )
      }

      // Output clean table to the console
      if (argv.verbose) {
        const imageWidthsTable = new table({
          head: ['viewport width', 'image width'],
          colAligns: ['right', 'right'],
          style: {
            head: ['green', 'green'],
            compact: true,
          },
        })
        imageWidths.map(row =>
          imageWidthsTable.push([row[0] + 'px', row[1] + 'px']),
        )
        console.log(imageWidthsTable.toString())
      }
    })
    .catch(error =>
      console.log(
        color.red(`Couldn't load page located at ${argv.url}:\n${error}`),
      ),
    )

  await page.browser().close()

  /* ======================================================================== */
  if (argv.verbose) {
    console.log(
      color.bgCyan.black(
        '\nStep 3: compute optimal n sizes from both datasets',
      ),
    )
  }

  let srcset = []

  // Compute data
  // todo

  if (argv.verbose) {
    console.dir(srcset)
  }

  // Save data into the CSV file
  if (argv.destfile) {
    let fileString = `
page           : ${argv.url}
image selector : ${argv.selector}
sizes in srcset: ${srcset.join(',')}`
    await writeFile(argv.destfile, fileString)
      .then(() => {
        if (argv.verbose) {
          console.log(color.green(`Data saved to file ${argv.destfile}`))
        }
      })
      .catch(error =>
        console.log(
          color.red(`Couldn't save data to file ${argv.destfile}:\n${error}`),
        ),
      )
  }
})()
