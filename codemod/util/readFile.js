// From:
// https://github.com/mui/material-ui/blob/master/packages/mui-codemod/src/util/readFile.js
import fs from 'fs'
import { EOL } from 'os'

export default function readFile(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8').toString()
  if (EOL !== '\n') {
    return fileContents.replace(/\n/g, EOL)
  }

  return fileContents
}
