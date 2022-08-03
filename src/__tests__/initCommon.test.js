import initCommon from 'src/initCommon'
import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'
import isClientSide from 'src/isClientSide'

jest.mock('src/config')
jest.mock('src/logDebug')
jest.mock('src/isClientSide')

beforeEach(() => {
  isClientSide.mockReturnValue(true)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('initCommon', () => {
  it('calls setDebugEnabled with true if config.debug is true', () => {
    expect.assertions(1)
    initCommon({ debug: true })
    expect(setDebugEnabled).toHaveBeenCalledWith(true)
  })

  it('calls setDebugEnabled with false if config.debug is truthy but non-true', () => {
    expect.assertions(1)
    initCommon({ debug: 'yes' })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setDebugEnabled with false if config.debug is false', () => {
    expect.assertions(1)
    initCommon({ debug: false })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setConfig with the provided config', () => {
    expect.assertions(1)
    initCommon({ some: 'config' })
    expect(setConfig).toHaveBeenCalledWith({ some: 'config' })
  })
})
