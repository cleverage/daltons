# Responsive Image Widths

A command-line tool helping the choice of optimal responsive image widths to put in your `srcset` attribute(s).

Run `node responsive-image-sizes.js -h`

## Steps required to get the image widths list

### Step 1: get actual contexts (viewports and screen densities) of site visitors

#### Load data listing page views with actual contexts of site visitors

This step requires a CSV file with the following columns:

- viewport width in `px`
- screen density in `dppx`
- number of page views in this context

There are a few requirements:

- use a comma separator
- don't use any thousands separator
- viewport width and number of page views are integers
- screen density is a float using a dot as decimal separator

#### Getting these data with an Analytics solution

You can feed custom dimensions to your Analytics solution:

```javascript
// get device pixel ratio in dppx
// https://github.com/ryanve/res/blob/master/src/index.js
var screen_density =
  typeof window == 'undefined'
    ? 0
    : +window.devicePixelRatio ||
      Math.sqrt(screen.deviceXDPI * screen.deviceYDPI) / 96 ||
      0
// keep only 3 decimals: http://jsfiddle.net/AsRqx/
screen_density = +(Math.round(screen_density + 'e+3') + 'e-3')

// get viewport width
// http://stackoverflow.com/a/8876069/717195
var viewport_width = Math.max(
  document.documentElement.clientWidth,
  window.innerWidth || 0,
)

// Code to send these custom dimensions to Google Analytics
ga('create', '<GoogleAnalyticsId>', 'auto')

ga('set', {
  dimension1: screen_density,
  dimension2: viewport_width,
})

ga('send', 'pageview')
```

### Step 2: get variations of image width across viewport widths

A script running a headless Chrome with [Puppeteer](https://developers.google.com/web/tools/puppeteer/) will get the CSS width of an image on every relevant viewport widths.

### Step 3: compute optimal n widths from both datasets

Computing both datasets will help define optimal widths for the `srcset` attribute of the responsive image.

## How to deal with multiple `<source>` with `mix/max-width` media queries (Art Direction)

If you have some code like this:

```html
<picture>
  <source media="(min-width: 800px)" srcset="…" sizes="…">
  <img srcset="…" sizes="…" alt="…">
</picture>
```

You will have to run the script twice, with (at least) these parameters, to get widths for both `srcset`s:

```shell
node responsive-image-sizes.js --maxviewport 799
node responsive-image-sizes.js --minviewport 800
```
