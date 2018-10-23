[Back home](/)

# Detailed options

Quite a lot of options are necessary to run `responsive-image-widths`, some being mandatory and other optional.

Here are the details:

## Global options to limit viewport widths

These options can be useful:

- When some viewport width values taken from statistics are obviously out of range
- For the [Art Direction](/responsive-image-widths/art-direction.html) use case

<aside class="warning">
Warning: reducing the number of viewport widths to check also speeds up the script execution, but be careful with results based only on a subset of actual values.
</aside>

| option          | alias | required? | type   | default value | description                               |
| --------------- | ----- | --------- | ------ | ------------- | ----------------------------------------- |
| `--minViewport` | `-i`  | optional  | number |               | Sets the minimum viewport width to check. |
| `--maxViewport` | `-x`  | optional  | number |               | Sets the maximum viewport width to check. |

## Step 1: get actual contexts of site visitors

| option           | alias | required? | type      | default value | description                                           |
| ---------------- | ----- | --------- | --------- | ------------- | ----------------------------------------------------- |
| `--contextsFile` |       | required  | file path |               | File path from which reading the actual contexts data |

You need to provide a file with contexts, which means statistics about viewport widths and screen density of the website’s visitors.

The contexts file should be in [<abbr title="Coma-Separated Values">CSV</abbr>](https://en.wikipedia.org/wiki/Comma-separated_values) format, with these three columns:

- screen density, in dppx
- viewport width, in px
- number of page views

See the provided example: [contexts.csv](https://github.com/cleverage/responsive-image-widths/blob/master/examples/simple/contexts.csv)

## Step 2: get variations of image width across viewport widths

| option  | alias | required? | type | default value | description                                                                           |
| ------- | ----- | --------- | ---- | ------------- | ------------------------------------------------------------------------------------- |
| `--url` | `-u`  | required  | URL  |               | Defines the URL of the page in which to check the image width across viewport widths. |

## Step 3: compute optimal n widths from both datasets
