#!/usr/bin/env node
import fs from 'fs'

const isTsProject = fs.existsSync('./tsconfig.json')

if (isTsProject) {
  require('ts-node').register()
} else {
  require('@babel/register')
}

const appName = process.env['CORE_APP_NAME']
const args = JSON.parse(process.env['CORE_APP_ARGS'] || '{}')

require('./runApp').runApp(appName, args, !!process.env['CORE_DEMON'])
