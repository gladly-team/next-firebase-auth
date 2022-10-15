import path from 'path'
import jscodeshift from 'jscodeshift'
import transform from 'codemod/withauthuser-to-withuser'
import readFile from 'codemod/util/readFile'

function read(fileName) {
  return readFile(path.join(__dirname, fileName))
}

describe('withauthuser-to-withuser', () => {
  it('modifies the API name', () => {
    const actual = transform(
      {
        source: read('./withauthuser-to-withuser.test/inputA.js'),
        path: require.resolve(
          'codemod/withauthuser-to-withuser.test/outputA.js'
        ),
      },
      { jscodeshift },
      {}
    )

    const expected = read('./withauthuser-to-withuser.test/outputA.js')
    expect(actual).toEqual(expected)
  })

  it('modifies the API name when it was already renamed', () => {
    const actual = transform(
      {
        source: read('./withauthuser-to-withuser.test/inputB.js'),
        path: require.resolve(
          'codemod/withauthuser-to-withuser.test/outputB.js'
        ),
      },
      { jscodeshift },
      {}
    )

    const expected = read('./withauthuser-to-withuser.test/outputB.js')
    expect(actual).toEqual(expected)
  })
})
