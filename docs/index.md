# Responsive Image Widths

[![Build Status](https://travis-ci.org/cleverage/responsive-image-widths.svg?branch=master)](https://travis-ci.org/cleverage/responsive-image-widths)

`responsive-image-widths` is a command-line tool that computes optimal image widths to put in [`srcset`](https://html.spec.whatwg.org/multipage/embedded-content.html#attr-img-srcset) attributes of [responsive images](https://responsiveimages.org/).

## Steps required to get the image widths list

- [Step 1: get actual contexts (viewports and screen densities) of site visitors](/responsive-image-widths/step1.html)
- [Step 2: get variations of image width across viewport widths](/responsive-image-widths/step2.html)
- [Step 3: compute optimal n widths from both datasets](/responsive-image-widths/step3.html)

## Getting started

To install and run this application, you'll need [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

From your command line, install `responsive-image-widths` as a global package:

```
npm install -g "cleverage/responsive-image-widths#master"
```

Then run it with the `-h` option to get help:

```
npx responsive-image-widths -h
```

It will output the following help:

```
Global: limit viewport widths, for example for Art Direction (see docs)
  --minViewport, -i  Minimum viewport width to check  [number]
  --maxViewport, -x  Maximum viewport width to check  [number]

Step 1: get actual contexts of site visitors
  --contextsFile, -c  File path from which reading the actual contexts data in CSV format (screen density in dppx, viewport width in px, number of page views)  [string] [required]

Step 2: get variations of image width across viewport widths
  --url, -u             Page URL  [required]
  --selector, -s        Image selector in the page  [required]
  --delay, -d           Delay after viewport resizing before checking image width (ms)  [number] [default: 500]
  --variationsFile, -a  File path to which saving the image width variations data, in CSV format  [string]

Step 3: compute optimal n widths from both datasets
  --widthsNumber, -n  Number of widths to recommend  [number] [default: 5]
  --destFile, -f      File path to which saving the image widths for the srcset attribute  [string]

Options:
  --version      Show version number  [boolean]
  --verbose, -v  Log progress and result in the console
  -h, --help     Show help  [boolean]

Examples:
  npx cli.js --contextsFile ./contexts.csv --url 'https://example.com/' --selector 'main img[srcset]:first-of-type' --verbose
  npx cli.js -c ./contexts.csv -u 'https://example.com/' -s 'main img[srcset]:first-of-type' -i 320 -x 1280 -a ./variations.csv -f ./srcset-widths.txt -v
```

See [details about each option](/responsive-image-widths/options.html).

## Use cases

- [How to deal with multiple `<source>` with `mix/max-width` media queries (Art Direction)](/responsive-image-widths/art-direction.html)
