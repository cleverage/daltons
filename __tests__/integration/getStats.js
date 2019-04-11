const path = require('path')
const getStats = require('../../src/getStats')

describe('Stats parsing from CSV file', () => {
  it(`example csv`, async () => {
    expect(
      getStats(path.resolve(__dirname, '../../examples/simple/stats.csv')),
    ).toMatchSnapshot()
  }, 200)
})
