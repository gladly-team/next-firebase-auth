import renameImport from './util/renameImport'

const originalAPIName = 'useAuthUser'
const newAPIName = 'useUser'

export default function transformer(file, api, options) {
  return renameImport({ file, api, options }, { originalAPIName, newAPIName })
}
