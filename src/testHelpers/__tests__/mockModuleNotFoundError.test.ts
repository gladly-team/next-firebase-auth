import ModuleNotFoundErrorMock from 'src/testHelpers/mockModuleNotFoundError'

describe('mockModuleNotFoundError', () => {
  it('returns the expected error when provided only a moduleName', () => {
    const err = new ModuleNotFoundErrorMock({ moduleName: 'foo' })
    expect(err.code).toEqual('MODULE_NOT_FOUND')
    expect(err.message).toEqual(
      "Cannot find module 'foo' from 'exampleModule.js'"
    )
  })

  it('returns the expected error when provided a callingModule name', () => {
    const err = new ModuleNotFoundErrorMock({
      moduleName: 'blah',
      callingModule: 'some/module.js',
    })
    expect(err.code).toEqual('MODULE_NOT_FOUND')
    expect(err.message).toEqual(
      "Cannot find module 'blah' from 'some/module.js'"
    )
  })
})
