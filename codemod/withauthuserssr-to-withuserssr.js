import renameImport from 'codemod/util/renameImport'

const originalAPIName = 'withAuthUser'
const newAPIName = 'withUser'

export default function transformer(file, api, options) {
  return renameImport({ file, api, options }, { originalAPIName, newAPIName })
}
