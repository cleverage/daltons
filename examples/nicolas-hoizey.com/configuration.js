module.exports = {
  statsFile: `${__dirname}/stats.csv`,
  url: `file://${__dirname}/page.html`,
  selector: '.main img[srcset]:first-of-type',
  maxViewport: 2560,
  delay: 20,
}
