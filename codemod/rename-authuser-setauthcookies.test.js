import path from 'path'
import jscodeshift from 'jscodeshift'
import transform from 'codemod/rename-authuser-setauthcookies'
import readFile from 'codemod/util/readFile'

function read(fileName) {
  return readFile(path.join(__dirname, fileName))
}

const transformName = `rename-authuser-setauthcookies`

describe('setAuthCookies return property change: AuthUser -> user', () => {
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

  it('does not affect unrelated variables named `AuthUser`', () => {
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

  it('works with a promise variable not immediately awaited', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputC.js`),
        path: require.resolve(`./${transformName}.fixtures/inputC.js`),
      },
      { jscodeshift },
      {}
    )
    const expected = read(`./${transformName}.fixtures/outputC.js`)
    expect(actual).toEqual(expected)
  })

  it('does not affect functions named setAuthCookies imported from elsewhere', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputD.js`),
        path: require.resolve(`./${transformName}.fixtures/inputD.js`),
      },
      { jscodeshift },
      {}
    )
    const expected = read(`./${transformName}.fixtures/outputD.js`)
    expect(actual).toEqual(expected)
  })

  it('works when using promise syntax with an arrow function', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputE.js`),
        path: require.resolve(`./${transformName}.fixtures/inputE.js`),
      },
      { jscodeshift },
      {}
    )
    const expected = read(`./${transformName}.fixtures/outputE.js`)
    expect(actual).toEqual(expected)
  })

  it('works with variable reassignment', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputF.js`),
        path: require.resolve(`./${transformName}.fixtures/inputF.js`),
      },
      { jscodeshift },
      {}
    )
    const expected = read(`./${transformName}.fixtures/outputF.js`)
    expect(actual).toEqual(expected)
  })

  it('works when using promise syntax with a function expression', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputG.js`),
        path: require.resolve(`./${transformName}.fixtures/inputG.js`),
      },
      { jscodeshift },
      {}
    )
    const expected = read(`./${transformName}.fixtures/outputG.js`)
    expect(actual).toEqual(expected)
  })

  it('does not modify or throw an error if variables are assigned from setAuthCookies but they do not include "AuthUser"', () => {
    const actual = transform(
      {
        source: read(`./${transformName}.fixtures/inputH.js`),
        path: require.resolve(`./${transformName}.fixtures/inputH.js`),
      },
      { jscodeshift },
      {}
    )
    const expected = read(`./${transformName}.fixtures/outputH.js`)
    expect(actual).toEqual(expected)
  })
})
