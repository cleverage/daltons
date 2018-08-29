#!/bin/sh
node ../../responsive-image-sizes.js --contextsfile ./contexts.csv --url 'https://nicolas-hoizey.com/2017/01/how-much-data-should-my-service-worker-put-upfront-in-the-offline-cache.html' --selector '.main img[srcset]:first-of-type' --maxviewport 2560 --delay 100 --verbose
