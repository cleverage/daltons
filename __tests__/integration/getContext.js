const path = require('path')
const getContexts = require('../../src/getContexts')

describe('Stats parsing from CSV file', () => {
  it(`example csv`, async () => {
    expect(
      getContexts(
        path.resolve(__dirname, '../../examples/simple/contexts.csv'),
      ),
    ).toMatchSnapshot()
  }, 200)
})
