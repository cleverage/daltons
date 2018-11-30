const fs = require('fs')
const path = require('path')

const examplesPath = path.join(__dirname, '../../examples')

describe('examples', () => {
  const SUT = require('../../src/index.js')

  // Declare tests automatically depending on the existing folders within ./examples
  // Use sync method in order to declare test cases synchronously
  const examples = fs.readdirSync(examplesPath)

  examples.forEach(exampleName => {
    it(`${exampleName} example should return the list of perfect width for its image and contexts`, async () => {
      expect.assertions(1)

      const configurationFile = path.join(
        examplesPath,
        `${exampleName}/configuration.js`,
      )
      const resultsFile = path.join(examplesPath, `${exampleName}/result.js`)

      const config = require(configurationFile)
      const actualResults = await SUT(config)

      expect(actualResults).toMatchSnapshot()
    }, 600000)
  })
})
