function ModuleNotFoundError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: any,
  {
    moduleName,
    callingModule = 'exampleModule.js',
  }: {
    moduleName: string
    callingModule: string
  }
) {
  this.name = 'ModuleNotFoundError'
  this.code = 'MODULE_NOT_FOUND'
  this.message = `Cannot find module '${moduleName}' from '${callingModule}'`
}
ModuleNotFoundError.prototype = Error.prototype

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default ModuleNotFoundError as any
