#!/usr/bin/env node
/**
 * Choose optimal responsive image widths to put in your `srcset` attribute
 *
 * Usage:
 *
 *     npx daltons -h
 */
const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const color = require('ansi-colors')
const run = require('./index.js')

const currentPath = process.cwd()

const argv = yargs
  .options({
    statsFile: {
      alias: 'c',
      describe:
        'File path from which reading the actual stats in CSV format (screen density in dppx, viewport width in px, number of page views)',
      demandOption: true,
      type: 'string',
    },
    minViewport: {
      alias: 'i',
      describe: 'Minimum viewport width to check',
      type: 'number',
    },
    maxViewport: {
      alias: 'x',
      describe: 'Maximum viewport width to check',
      type: 'number',
    },
    minDensity: {
      describe: 'Minimum screen density to consider',
      type: 'number',
    },
    maxDensity: {
      describe: 'Maximum screen density to consider',
      type: 'number',
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
    delay: {
      alias: 'd',
      describe:
        'Delay after viewport resizing before checking image width (ms)',
      default: 100,
      type: 'number',
    },
    variationsFile: {
      alias: 'a',
      describe:
        'File path to which saving the image width variations data, in CSV format',
      type: 'string',
    },
    minPercentage: {
      describe:
        'Minimum percentage of "perfect" image width to keep from stats (0 <= % < 1)',
      type: 'number',
      default: 0.0001,
    },
    widthsDivisor: {
      alias: 'o',
      describe: 'Number by which the computed widths must be divisible',
      default: 10,
      type: 'number',
    },
    widthsNumber: {
      alias: 'n',
      describe: 'Number of widths to recommend',
      default: 5,
      type: 'number',
    },
    destFile: {
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
  .group(
    ['minViewport', 'maxViewport'],
    'Global: limit viewport widths, for example for Art Direction (see docs)',
  )
  .group(
    ['statsFile', 'minDensity', 'maxDensity'],
    'Step 1: get actual stats of site visitors',
  )
  .group(
    ['url', 'selector', 'delay', 'variationsFile'],
    'Step 2: get variations of image width across viewport widths',
  )
  .group(
    ['minPercentage', 'widthsDivisor', 'widthsNumber', 'destFile'],
    'Step 3: compute optimal n widths from both datasets',
  )
  .check((argv) => {
    // waiting for https://github.com/yargs/yargs/issues/1079
    if (argv.minViewport !== undefined && isNaN(argv.minViewport)) {
      throw new Error(
        color.red(`Error: ${color.redBright('minViewport')} must be a number`),
      )
    }
    if (argv.minViewport < 0) {
      throw new Error(
        color.red(`Error: ${color.redBright('minViewport')} must be >= 0`),
      )
    }
    if (argv.maxViewport !== undefined && isNaN(argv.maxViewport)) {
      throw new Error(
        color.red(`Error: ${color.redBright('maxViewport')} must be a number`),
      )
    }
    if (argv.maxViewport < argv.minViewport) {
      throw new Error(
        color.red(
          `Error: ${color.redBright(
            'maxViewport',
          )} must be greater than minViewport`,
        ),
      )
    }
    if (argv.minDensity !== undefined && isNaN(argv.minDensity)) {
      throw new Error(
        color.red(`Error: ${color.redBright('minDensity')} must be a number`),
      )
    }
    if (argv.minDensity < 0) {
      throw new Error(
        color.red(`Error: ${color.redBright('minDensity')} must be >= 0`),
      )
    }
    if (argv.maxDensity !== undefined && isNaN(argv.maxDensity)) {
      throw new Error(
        color.red(`Error: ${color.redBright('maxDensity')} must be a number`),
      )
    }
    if (argv.maxDensity < argv.minDensity) {
      throw new Error(
        color.red(
          `Error: ${color.redBright(
            'maxDensity',
          )} must be greater than minDensity`,
        ),
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
    if (
      argv.variationsFile &&
      fs.existsSync(path.resolve(currentPath, argv.variationsFile))
    ) {
      throw new Error(
        color.red(
          `Error: file ${argv.variationsFile} set with ${color.redBright(
            'variationsFile',
          )} already exists`,
        ),
      )
    }
    if (argv.minPercentage !== undefined && isNaN(argv.minPercentage)) {
      throw new Error(
        color.red(
          `Error: ${color.redBright(
            'minPercentage',
          )} must be a number, between 0 and 1`,
        ),
      )
    }
    if (argv.minPercentage < 0 || argv.minPercentage >= 1) {
      throw new Error(
        color.red(
          `Error: ${color.redBright('minPercentage')} must be >= 0 and < 1`,
        ),
      )
    }
    if (isNaN(argv.widthsDivisor)) {
      throw new Error(
        color.red(
          `Error: ${color.redBright('widthsDivisor')} must be a number`,
        ),
      )
    }
    if (isNaN(argv.widthsNumber)) {
      throw new Error(
        color.red(`Error: ${color.redBright('widthsNumber')} must be a number`),
      )
    }
    if (
      argv.destFile &&
      fs.existsSync(path.resolve(currentPath, argv.destFile))
    ) {
      throw new Error(
        color.red(
          `Error: file ${argv.destFile} set with ${color.redBright(
            'destFile',
          )} already exists`,
        ),
      )
    }
    if (!argv.destFile && !argv.verbose) {
      throw new Error(
        color.red(
          `Error: data should be either saved in a file (${color.redBright(
            'destFile',
          )} and/or output to the console (${color.redBright('verbose')})`,
        ),
      )
    }
    return true
  })
  .alias('h', 'help')
  .help()
  .example(
    "npx $0 --statsFile ./stats.csv --url 'https://example.com/' --selector 'main img[srcset]:first-of-type' --verbose",
  )
  .example(
    "npx $0 -c ./stats.csv -u 'https://example.com/' -s 'main img[srcset]:first-of-type' -i 320 -x 1280 -a ./variations.csv -f ./srcset-widths.txt -v",
  )
  .wrap(null)
  .detectLocale(false).argv

run(argv)
