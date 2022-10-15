import path from 'path'
import jscodeshift from 'jscodeshift'
import transform from 'codemod/withauthusertokenssr-to-withusertokenssr'
import readFile from 'codemod/util/readFile'

function read(fileName) {
  return readFile(path.join(__dirname, fileName))
}

describe('withauthuser-to-withuser', () => {
  it('modifies the API name', () => {
    const actual = transform(
      {
        source: read(
          './withauthusertokenssr-to-withusertokenssr.test/inputA.js'
        ),
        path: require.resolve(
          'codemod/withauthuser-to-withuser.test/outputA.js'
        ),
      },
      { jscodeshift },
      {}
    )

    const expected = read(
      './withauthusertokenssr-to-withusertokenssr.test/outputA.js'
    )
    expect(actual).toEqual(expected)
  })
})
