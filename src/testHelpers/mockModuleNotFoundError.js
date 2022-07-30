function ModuleNotFoundError({
  moduleName,
  callingModule = 'exampleModule.js',
}) {
  this.name = 'ModuleNotFoundError'
  this.code = 'MODULE_NOT_FOUND'
  this.message = `Cannot find module '${moduleName}' from '${callingModule}'`
}
ModuleNotFoundError.prototype = Error.prototype

export default ModuleNotFoundError
