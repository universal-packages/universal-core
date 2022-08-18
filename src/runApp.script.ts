#!/usr/bin/env node
import fs from 'fs'

const isTsproject = fs.existsSync('./tsconfig.json')

if (isTsproject) {
  require('ts-node').register()
} else {
  require('@babel/register')
}

const appName = process.env['CORE_APP_NAME']
const args = JSON.parse(process.env['CORE_APP_ARGS'] || '{}')

require('./runApp').runApp(appName, args, !!process.env['CORE_DEMON'])
