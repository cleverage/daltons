#!/bin/sh
path=`pwd`
node ../../src/cli.js --stats-file ./stats.csv --url "file://${path}/page.html" --selector '.main img[srcset]:first-of-type' --max-viewport 2560 --delay 100 --verbose
