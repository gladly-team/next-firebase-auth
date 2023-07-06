// Adapted from:
// https://github.com/mui/material-ui/blob/master/packages/mui-codemod/src/v5.0.0/fade-rename-alpha.js

const renameImport = (
  { file, api, options },
  { originalAPIName, newAPIName }
) => {
  const { jscodeshift } = api
  const root = jscodeshift(file.source)

  const printOptions = options.printOptions || {
    quote: 'single',
  }

  let importFound = false

  root.find(jscodeshift.ImportDeclaration).forEach((path) => {
    if (path.node.source.value.match(/^next-firebase-auth$/)) {
      path.node.specifiers.forEach((specifier) => {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.name === originalAPIName
        ) {
          // eslint-disable-next-line no-param-reassign
          specifier.imported = jscodeshift.identifier(newAPIName)
          importFound = true
        }
      })
    }
  })

  if (importFound) {
    return root
      .find(jscodeshift.CallExpression, { callee: { name: originalAPIName } })
      .forEach((path) => {
        // eslint-disable-next-line no-param-reassign
        path.node.callee.name = newAPIName
      })
      .toSource(printOptions)
  }
  return file.source
}

export default renameImport
