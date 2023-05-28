import renameImport from 'codemod/util/renameImport'

const originalAPIName = 'withAuthUserTokenSSR'
const newAPIName = 'withUserTokenSSR'

export default function transformer(file, api, options) {
  return renameImport({ file, api, options }, { originalAPIName, newAPIName })
}
