# Daltons

[![Travis build status](https://img.shields.io/travis/cleverage/daltons.svg?style=popout)](https://travis-ci.org/cleverage/daltons)
[![Known Vulnerabilities](https://snyk.io/test/github/cleverage/daltons/badge.svg?targetFile=package.json)](https://snyk.io/test/github/cleverage/daltons?targetFile=package.json)
[![License](https://img.shields.io/github/license/cleverage/daltons.svg?style=popout)](https://github.com/cleverage/daltons/blob/master/LICENSE.md)
[![GitHub stars](https://img.shields.io/github/stars/cleverage/daltons.svg?style=social)](https://github.com/cleverage/daltons/stargazers)

`daltons` is a command-line tool that computes optimal image widths to put in [`srcset`](https://html.spec.whatwg.org/multipage/embedded-content.html#attr-img-srcset) attributes of [responsive images](https://responsiveimages.org/).

## Why do we need this tool?

We want to provide the best experience to [our clients](https://www.clever-age.com/en/our-work/)’ users, so optimizing web performance is one of our main concerns.

Using responsive images in every projects, we wanted to be able to make it as efficient as possible. The main difficulty is choosing the image widths we put in `srcset` attributes, because nothing in the standard tells us about this.

## How can we choose the responsive image widths?

We didn’t invent anything here, we’re standing on the shoulders of giants.

Back in 2015, [Jason Grigsby](https://cloudfour.com/is/jason-grigsby/) wrote this in [Responsive Images 101, Part 9: Image Breakpoints](https://cloudfour.com/thinks/responsive-images-101-part-9-image-breakpoints/):

> we want to provide multiple image sources because of performance concerns, different screen densities, etc. [but] we can’t simply reuse our responsive layout breakpoints for our images.

Jason presented a few ways to decide which image sizes to put in the `srcset` attribute of responsive images.

[Cloudinary](https://cloudinary.com) then developed the [Responsive Image Breakpoints Generator](https://www.responsivebreakpoints.com/), based on Jason’s [setting image breakpoints based on a performance budget](https://cloudfour.com/thinks/responsive-images-101-part-9-image-breakpoints/#setting-image-breakpoints-based-on-a-performance-budget) idea. It was already a good optimization.

> We’d start by defining a budget for the amount of wasted bytes that the browser would be allowed to download above what is needed to fit the size of the image in the page.

But we believe the most efficient of Jason’s ideas is [setting image breakpoints based on most frequent requests](https://cloudfour.com/thinks/responsive-images-101-part-9-image-breakpoints/#setting-image-breakpoints-based-on-most-frequent-requests), inspired by a discussion with [Yoav Weiss](https://blog.yoav.ws/) from Akamai (who made [Blink and webkit support responsive images](https://blog.yoav.ws/by_the_people/) before joining Akamai) and [Ilya Grigorik](https://www.igvita.com/) from Google:

> For these organizations, they can tie their image processing and breakpoints logic to their analytics and change the size of the images over time if they find that new image sizes are getting requested more frequently.

Jason Grigsby also wrote in the same article that [humans shouldn’t be doing this](https://cloudfour.com/thinks/responsive-images-101-part-9-image-breakpoints/#humans-shouldnt-be-doing-this), and we agree. That’s why we starting developing `daltons`.

## How does it work?

It takes 3 steps for `daltons` to find the best widths to put in the `srcset` attribute of a responsive image:

- [Step 1: take Real User Monitoring (RUM) of viewport widths and screen densities used on the website](/daltons/step1.html)
- [Step 2: detect the image’s widths across all of these viewport widths](/daltons/step2.html)
- [Step 3: compute the optimal image widths to put in the `srcset` attribute to cover all these needs](/daltons/step3.html)

## Getting started

To install and run this application, you’ll need [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

From your command line, install `daltons` as a global package:

```
npm install -g "cleverage/daltons#master"
```

Then run it with the `-h` option to get help:

```
npx daltons -h
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

See [details about each option](/daltons/options.html).

## Examples and use cases

There are a few examples in the project’s repository: [examples](https://github.com/cleverage/daltons/tree/master/examples)

Use cases:

- [How to deal with multiple `<source>` with `mix/max-width` media queries (Art Direction)](/daltons/art-direction.html)

