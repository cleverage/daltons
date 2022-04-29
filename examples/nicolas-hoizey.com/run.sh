#!/bin/sh
path=$(pwd)
node ../../src/cli.js --stats-file ./stats.csv --url "file://${path}/page.html" --selector '.main img[srcset]:first-of-type' --max-viewport 1600 --delay 5 --verbose
