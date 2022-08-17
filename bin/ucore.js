#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

try {
  require('@babel/register')
} catch (_) {
  const spawnerHasTsConfig = fs.existsSync('./tsconfig.json')

  require('ts-node').register({ cwd: spawnerHasTsConfig ? './' : path.resolve(__dirname, '..') })
}

try {
  const compiledCli = fs.existsSync('../cli.js')

  if (compiledCli) {
    require('../cli')
  } else {
    require('../src/cli')
  }
} catch (error) {
  // There was an actual error in this TS library
  if (process[Symbol.for('ts-node.register.instance')] !== undefined) {
    console.log(error)
  }
}
