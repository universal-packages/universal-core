#!/usr/bin/env node

require('ts-node').register()

try {
  require('../src/cli/index.ts')
} catch (error) {
  // There was an actual error in this TS library
  if (process[Symbol.for('ts-node.register.instance')] !== undefined) {
    console.log(error)
  } else {
    require('../src/cli/index.js')
  }
}
