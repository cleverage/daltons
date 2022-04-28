module.exports = {
  statsFile: `${__dirname}/stats.csv`,
  url: `file://${__dirname}/page.html`,
  selector: '.main img[srcset]:first-of-type',
  maxViewport: 1600,
  delay: 20,
}
