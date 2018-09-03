#!/bin/sh
path=`pwd`
node ../../index.js --contextsfile ./contexts.csv --url "file://${path}/page.html" --selector 'img' --verbose
