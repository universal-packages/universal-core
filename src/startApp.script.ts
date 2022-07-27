#!/usr/bin/env node

const appName = process.env['CORE_APP_NAME']
const args = JSON.parse(process.env['CORE_APP_ARGS'] || '{}')
const demon = process.env['CORE_DEMON']

require('ts-node').register()
require('./startApp').startApp(appName, args, !!process.env['CORE_DEMON'])
