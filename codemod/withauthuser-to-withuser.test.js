import path from 'path'
import jscodeshift from 'jscodeshift'
import transform from 'codemod/withauthuser-to-withuser'
import readFile from 'codemod/util/readFile'

function read(fileName) {
  return readFile(path.join(__dirname, fileName))
}

const transformName = `withauthuser-to-withuser`

describe('withAuthUser -> withUser', () => {
  it('modifies the API name', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputA.js`),
        path: require.resolve(`./${transformName}.fixtures/inputA.js`),
      },
      { jscodeshift },
      {}
    )

    const expected = read(`./${transformName}.fixtures/outputA.js`)
    expect(actual).toEqual(expected)
  })

  it('modifies the API name when it is renamed on import', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputA.js`),
        path: require.resolve(`./${transformName}.fixtures/inputA.js`),
      },
      { jscodeshift },
      {}
    )

    const expected = read(`./${transformName}.fixtures/outputA.js`)
    expect(actual).toEqual(expected)
  })
})
