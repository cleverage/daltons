[< Back home](/daltons/)

# Step 1: take Real User Monitoring (RUM) of viewport widths and screen densities used on the website

## Load data listing page views with actual contexts of site visitors

You need to provide a file with contexts, which are statistics about viewport widths and screen density of the website’s visitors.

The contexts file should be in [<abbr title="Coma-Separated Values">CSV</abbr>](https://en.wikipedia.org/wiki/Comma-separated_values) format, with these three columns:

- viewport width in `px`
- screen density in `dppx`
- number of page views in this context

There are a few requirements:

- put column headers in first row
- use a comma separator
- don’t use any thousands separator
- viewport width and number of page views are integers
- screen density is a float using a dot as decimal separator

See this example from the project’s repository: [contexts.csv](https://github.com/cleverage/daltons/blob/master/examples/simple/contexts.csv)

## Getting these data with an Analytics solution

You should be able to feed custom dimensions to your Analytics solution.

### Computing values

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
```

### Sending data to the analytics solution

Here is the code to use to send these data to Google Analytics:

```javascript
// Code to send these custom dimensions to Google Analytics
ga('create', '<GoogleAnalyticsId>', 'auto')

ga('set', {
  dimension1: screen_density,
  dimension2: viewport_width,
})

ga('send', 'pageview')
```

You will then have to get the data from your Analytics solution. Wait for a while to get accurate data, depending on your traffic.

*Note: Google Analytics provides [a native browserSize variable](https://developers.google.com/analytics/devguides/reporting/core/dimsmets#view=detail&group=platform_or_device&jump=ga_browsersize), but it is a session-scoped dimension. We need pageview-scoped dimensions (hence `ga('send', 'pageview')`) because we will use these data to optimize image sizes for each page view. Viewport width (and screen density) of one user with multiple page views (actually browsing the site, more engaged) should influence the optimizations more than one user bouncing with one single page view, so sessions are not as accurate as page views.*

### Using collected data

Here’s how to create a custom report in Google Analytics, for example:

![Creating a custom report in Google Analytics](ga-custom-report.png)
