import initCommon from 'src/initCommon'
import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'
import isClientSide from 'src/isClientSide'
import { ConfigInput } from 'src/configTypes'

jest.mock('src/config')
jest.mock('src/logDebug')
jest.mock('src/isClientSide')

const mockIsClientSide = jest.mocked(isClientSide)

beforeEach(() => {
  mockIsClientSide.mockReturnValue(true)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('initCommon', () => {
  it('calls setDebugEnabled with true if config.debug is true', () => {
    expect.assertions(1)
    initCommon({ debug: true } as unknown as ConfigInput)
    expect(setDebugEnabled).toHaveBeenCalledWith(true)
  })

  it('calls setDebugEnabled with false if config.debug is truthy but non-true', () => {
    expect.assertions(1)
    initCommon({ debug: 'yes' } as unknown as ConfigInput)
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setDebugEnabled with false if config.debug is false', () => {
    expect.assertions(1)
    initCommon({ debug: false } as unknown as ConfigInput)
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setConfig with the provided config', () => {
    expect.assertions(1)
    initCommon({ some: 'config' } as unknown as ConfigInput)
    expect(setConfig).toHaveBeenCalledWith({ some: 'config' })
  })
})
