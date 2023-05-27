import { get } from 'lodash/object'

const funcName = 'setAuthCookies'
const originalPropertyName = 'AuthUser'
const newPropertyName = 'user'

// Useful for exploring ASTs:
// https://astexplorer.net
const findParentVarDeclaratorPath = (path) => {
  const nodeType = path.value.type
  const stopTypes = ['ExpressionStatement', 'BlockStatement']
  if (stopTypes.includes(nodeType) || !path.parentPath) {
    return null
  }
  if (nodeType === 'VariableDeclarator') {
    return path
  }
  return findParentVarDeclaratorPath(path.parentPath)
}

const findResultingVarObjPath = (jscodeshift, path) => {
  const { type } = path.value.id || {}
  if (!type) {
    return null
  }
  if (type === 'ObjectPattern') {
    return path
  }
  if (type === 'Identifier') {
    // Find the usage of the return value variable
    const varName = path.value.id.loc.identifierName
    const identifiers = jscodeshift(path.parentPath.parentPath.parentPath).find(
      jscodeshift.Identifier
    )
    let varNode
    identifiers.forEach((node) => {
      if (get(node, 'value.loc.identifierName') === varName) {
        varNode = node
      }
    })
    return findResultingVarObjPath(
      jscodeshift,
      findParentVarDeclaratorPath(varNode.parentPath)
    )
  }
  return null
}

export default function transformer(file, api, options) {
  const { jscodeshift } = api
  const root = jscodeshift(file.source)

  // First, confirm that the file uses setUserCookies from NFA.
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
    // Find the object return value of `setUserCookies` and rename the
    // "AuthUser" key to "user", retaining the variable name of "AuthUser".
    return root
      .find(jscodeshift.CallExpression, { callee: { name: funcName } })
      .forEach((path) => {
        let varPath

        // Determine if the call uses promise or await syntax.
        const possiblePromiseFunc = get(
          path,
          'parentPath.parentPath.value.arguments[0]'
        )
        const hasPromiseFunc = !!(
          possiblePromiseFunc &&
          ['FunctionExpression', 'ArrowFunctionExpression'].includes(
            possiblePromiseFunc.type
          )
        )
        if (hasPromiseFunc) {
          // Promise syntax
          const returnValVarName = possiblePromiseFunc.params[0]

          // TODO: find any destructuring from this variable
          console.log(returnValVarName)
        } else {
          // Await syntax
          const varDeclaratorPath = findParentVarDeclaratorPath(path)
          if (!varDeclaratorPath) {
            return
          }
          varPath = findResultingVarObjPath(jscodeshift, varDeclaratorPath)
        }
        if (!varPath || !varPath.value) {
          return
        }
        const authUserProp = varPath.value.id.properties.find(
          (item) => item.key.name === originalPropertyName
        )
        if (!authUserProp) {
          return
        }
        authUserProp.key.name = newPropertyName
        authUserProp.value.shorthand = true // assign to AuthUser variable
      })
      .toSource(options.printOptions)
  }

  return file.source
}
