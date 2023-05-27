import { get } from 'lodash/object'

const funcName = 'withAuthUserSSR'
const originalPropertyName = 'AuthUser'
const newPropertyName = 'user'

export default function transformer(file, api, options) {
  const { jscodeshift } = api
  const root = jscodeshift(file.source)

  // First, confirm that the file uses withAuthUserSSR from NFA.
  let importFound = false
  root.find(jscodeshift.ImportDeclaration).forEach((path) => {
    if (path.node.source.value.match(/^next-firebase-auth$/)) {
      path.node.specifiers.forEach((specifier) => {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.name === funcName
        ) {
          importFound = true
        }
      })
    }
  })

  if (importFound) {
    return root
      .find(jscodeshift.CallExpression, { callee: { name: funcName } })
      .forEach((path) => {
        const grandparentPath = get(path, 'parentPath.parentPath')
        if (!grandparentPath) {
          return
        }
        const functionArg = get(
          grandparentPath,
          'value.init.arguments[0].params[0]'
        )
        if (!functionArg) {
          return
        }
        const functionArgProperties = get(functionArg, 'properties') || []
        const authUserProp = functionArgProperties.find(
          (item) => item.key.name === originalPropertyName
        )
        if (!authUserProp) {
          return
        }
        authUserProp.key.name = newPropertyName
        authUserProp.shorthand = false
      })
      .toSource(options.printOptions)
  }

  return file.source
}
