#!/usr/bin/env node

try {
  require('@babel/register')
} catch (_) {
  require('ts-node').register()
}

const appName = process.env['CORE_APP_NAME']
const args = JSON.parse(process.env['CORE_APP_ARGS'] || '{}')
const demon = process.env['CORE_DEMON']

require('./runApp').runApp(appName, args, !!process.env['CORE_DEMON'])
