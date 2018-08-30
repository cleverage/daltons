# Step 1: get actual contexts (viewports and screen densities) of site visitors

## Load data listing page views with actual contexts of site visitors

This step requires a CSV file with the following columns:

- viewport width in `px`
- screen density in `dppx`
- number of page views in this context

There are a few requirements:

- use a comma separator
- don't use any thousands separator
- viewport width and number of page views are integers
- screen density is a float using a dot as decimal separator

## Getting these data with an Analytics solution

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
