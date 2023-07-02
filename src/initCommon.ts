import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'
import { ConfigInput } from './configTypes'

// `init` behavior shared between the client and server init.
const initCommon = (config: ConfigInput) => {
  setDebugEnabled(config?.debug === true)
  setConfig(config)
}

export default initCommon
