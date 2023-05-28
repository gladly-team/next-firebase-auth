import renameImport from './util/renameImport'

const originalAPIName = 'withAuthUserSSR'
const newAPIName = 'withUserSSR'

export default function transformer(file, api, options) {
  return renameImport({ file, api, options }, { originalAPIName, newAPIName })
}
