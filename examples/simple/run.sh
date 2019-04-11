#!/bin/sh
path=`pwd`
node ../../src/cli.js --stats-file ./stats.csv --url "file://${path}/page.html" --selector 'img' --verbose
