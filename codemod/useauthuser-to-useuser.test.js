import path from 'path'
import jscodeshift from 'jscodeshift'
import transform from 'codemod/useauthuser-to-useuser'
import readFile from 'codemod/util/readFile'

function read(fileName) {
  return readFile(path.join(__dirname, fileName))
}

const transformName = `useauthuser-to-useuser`

describe('useAuthUser -> useUser', () => {
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
})
