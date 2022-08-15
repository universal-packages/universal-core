#!/usr/bin/env node

try {
  require('@babel/register')
} catch (_) {
  require('ts-node').register()
}

try {
  try {
    require('../src/cli')
  } catch (_) {
    require('../cli')
  }
} catch (error) {
  // There was an actual error in this TS library
  if (process[Symbol.for('ts-node.register.instance')] !== undefined) {
    console.log(error)
  } else {
    try {
      require('../src/cli')
    } catch (_) {
      require('../cli')
    }
  }
}
