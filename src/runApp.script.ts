#!/usr/bin/env -S node --import tsx
const fs = require('fs')

const appName = process.env['CORE_APP_NAME']
const args = JSON.parse(process.env['CORE_APP_ARGS'] || '{}')

require('./runApp').runApp(appName, { args, forked: !!process.env['CORE_FORK'] })
