import path from 'path'
import jscodeshift from 'jscodeshift'
import transform from 'codemod/rename-authuser-withauthusertokenssr'
import readFile from 'codemod/util/readFile'

function read(fileName) {
  return readFile(path.join(__dirname, fileName))
}

const transformName = `rename-authuser-withauthusertokenssr`

describe('withAuthUserTokenSSR argument property change: AuthUser -> user', () => {
  it('works as expected', () => {
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

  it('works as expected with reassigned variable name', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputB.js`),
        path: require.resolve(`./${transformName}.fixtures/inputB.js`),
      },
      { jscodeshift },
      {}
    )

    const expected = read(`./${transformName}.fixtures/outputB.js`)
    expect(actual).toEqual(expected)
  })
})
