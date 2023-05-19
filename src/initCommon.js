import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'

// `init` behavior shared between the client and server init.
const initCommon = (config) => {
  setDebugEnabled(config.debug === true)
  setConfig(config)
}

export default initCommon
