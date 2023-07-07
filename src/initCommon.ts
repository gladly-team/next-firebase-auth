import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'
import { ConfigInput } from './configTypes'

export type Init = (config: ConfigInput) => void

// `init` behavior shared between the client and server init.
const initCommon: Init = (config: ConfigInput) => {
  setDebugEnabled(config?.debug === true)
  setConfig(config)
}

export default initCommon
