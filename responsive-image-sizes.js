/**
 * Get the CSS width of an image in a page at different viewport widths
 *
 * Usage:
 *
 *     node responsive-image-sizes.js -h
 */

const puppeteer = require('puppeteer')
const color = require('ansi-colors')
const table = require('cli-table')

const sleep = timeout => new Promise(r => setTimeout(r, timeout))

const argv = require('yargs')
  .options({
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
      alias: 'min',
      describe: 'Minimum viewport width to check',
      default: 240,
      defaultDescription: '240: viewport width of some feature phones',
      type: 'number',
    },
    maxviewport: {
      alias: 'max',
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
  })
  .check(function(argv) {
    // waiting for https://github.com/yargs/yargs/issues/1079
    if (isNaN(argv.minviewport)) {
      throw new Error(color.red('Error: minviewport must be a number'))
    }
    if (argv.minviewport < 0) {
      throw new Error(color.red('Error: minviewport must be >= 0'))
    }
    if (isNaN(argv.maxviewport)) {
      throw new Error(color.red('Error: maxviewport must be a number'))
    }
    if (isNaN(argv.viewportstep)) {
      throw new Error(color.red('Error: viewportstep must be a number'))
    }
    if (argv.viewportstep < 1) {
      throw new Error(color.red('Error: viewportstep must be >= 1'))
    }
    if (isNaN(argv.delay)) {
      throw new Error(color.red('Error: delay must be a number'))
    }
    if (argv.delay < 0) {
      throw new Error(color.red('Error: delay must be >= 0'))
    }
    if (argv.maxviewport < argv.minviewport) {
      throw new Error(
        color.red('Error: maxviewport must be greater than minviewport'),
      )
    }
    return true
  })
  .help()
  .example(
    "$0 --url 'https://example.com/' --selector 'main img[srcset]:first-of-type'",
  )
  .example(
    "$0 -u 'https://example.com/' -s 'main img[srcset]:first-of-type' --min 320 --max 1280",
  )
  .wrap(null)
  .detectLocale(false).argv

const VIEWPORT = { width: argv.minviewport, height: 2000, deviceScaleFactor: 1 }
;(async () => {
  console.log(color.green('Launch headless Chrome'))
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  console.log(color.green('Go to ' + argv.url))
  await page.goto(argv.url, { waitUntil: 'networkidle2' }).then(async () => {
    console.log(color.green('Checking sizes of image ' + argv.selector))
    const sizesTable = new table({
      head: ['viewport', 'image'],
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    })
    process.stdout.write('Current viewport: ' + color.cyan(VIEWPORT.width))
    while (VIEWPORT.width <= argv.maxviewport) {
      // Set new viewport width
      await page.setViewport(VIEWPORT)

      // Give the browser some time to adjust layout, sometimes requiring JS
      await sleep(argv.delay)

      // Check image width
      let imageWidth = await page.evaluate(sel => {
        return document.querySelector(sel).width
      }, argv.selector)
      sizesTable.push([VIEWPORT.width, imageWidth])

      // Increment viewport width
      VIEWPORT.width += argv.viewportstep

      // Update log in the console
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
      if (VIEWPORT.width <= argv.maxviewport) {
        process.stdout.write(
          'Current viewport: ' + color.cyan(VIEWPORT.width) + 'px',
        )
      }
    }
    console.log(sizesTable.toString())
  })

  await page.browser().close()
})()
