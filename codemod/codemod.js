#!/usr/bin/env node
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

// Adapted from:
// https://github.com/mui/material-ui/blob/master/packages/mui-codemod/codemod.js

const childProcess = require('child_process')
const { promises: fs } = require('fs')
const path = require('path')
const yargs = require('yargs')
const jscodeshiftPackage = require('jscodeshift/package.json')

const jscodeshiftDirectory = path.dirname(require.resolve('jscodeshift'))
const jscodeshiftExecutable = path.join(
  jscodeshiftDirectory,
  jscodeshiftPackage.bin.jscodeshift
)

async function runTransform(transform, files, flags, codemodFlags) {
  let transforms = [transform]
  if (transform === 'all-v1') {
    transforms = [
      'rename-authuser-withauthusertokenssr',
      'rename-authuser-withauthuserssr',
      'withauthuser-to-withuser',
      'withauthusertokenssr-to-withusertokenssr',
      'withauthuserssr-to-withuserssr',
      'useauthuser-to-useuser',
      'rename-authuser-setauthcookies',
    ]
  }
  const transformerPaths = []
  for (const transformName of transforms) {
    const transformerSrcPath = path.resolve(__dirname, `${transformName}.js`)
    const transformerBuildPath = path.resolve(
      __dirname,
      './node',
      `${transform}.js`
    )
    let transformerPath
    try {
      await fs.stat(transformerSrcPath)
      transformerPath = transformerSrcPath
    } catch (srcPathError) {
      try {
        await fs.stat(transformerBuildPath)
        transformerPath = transformerBuildPath
      } catch (buildPathError) {
        if (buildPathError.code === 'ENOENT') {
          throw new Error(
            `Transform '${transform}' not found. Check out ${path.resolve(
              __dirname,
              './MIGRATION.md for a list of available codemods.'
            )}`
          )
        }
        throw buildPathError
      }
    }
    transformerPaths.push(transformerPath)
  }

  for (const transformerPath of transformerPaths) {
    const args = [
      jscodeshiftExecutable,
      '--transform',
      transformerPath,
      ...codemodFlags,
      '--extensions',
      'js,ts,jsx,tsx',
      '--parser',
      flags.parser || 'tsx',
      '--ignore-pattern',
      '**/node_modules/**',
    ]

    if (flags.dry) {
      args.push('--dry')
    }
    if (flags.print) {
      args.push('--print')
    }
    if (flags.jscodeshift) {
      args.push(flags.jscodeshift)
    }

    args.push(...files)
    // eslint-disable-next-line no-console -- debug information
    console.log(`Executing command: jscodeshift ${args.join(' ')}`)
    const jscodeshiftProcess = childProcess.spawnSync('node', args, {
      stdio: 'inherit',
    })

    if (jscodeshiftProcess.error) {
      throw jscodeshiftProcess.error
    }
  }
}

function run(argv) {
  const { codemod, paths, ...flags } = argv

  // eslint-disable-next-line no-console -- debug information
  console.log(`Running codemod ${codemod} on files at path ${paths}`)

  return runTransform(
    codemod,
    paths.map((filePath) => path.resolve(filePath)),
    flags,
    argv._
  )
}

yargs
  .command({
    command: '$0 <codemod> <paths...>',
    describe: 'Applies a next-firebase-auth codemod to the specified paths',
    builder: (command) =>
      command
        .positional('codemod', {
          description: 'The name of the codemod',
          type: 'string',
        })
        .positional('paths', {
          array: true,
          description: 'Paths forwarded to `jscodeshift`',
          type: 'string',
        })
        .option('dry', {
          description: 'dry run (no changes are made to files)',
          default: false,
          type: 'boolean',
        })
        .option('parser', {
          description: 'which parser for jscodeshift to use',
          default: 'tsx',
          type: 'string',
        })
        .option('print', {
          description:
            'print transformed files to stdout, useful for development',
          default: false,
          type: 'boolean',
        })
        .option('jscodeshift', {
          description: '(Advanced) Pass options directly to jscodeshift',
          default: false,
          type: 'string',
        }),
    handler: run,
  })
  .scriptName('npx -p next-firebase-auth codemod')
  .example('$0 rename-authuser-setauthcookies . --dry')
  .example('$0 withauthusertokenssr-to-withusertokenssr src')
  .help()
  .parse()
