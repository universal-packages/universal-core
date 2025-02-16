#!/usr/bin/env node

const appName = process.env['CORE_APP_NAME']
const args = JSON.parse(process.env['CORE_APP_ARGS'] || '{}')

if (process.env.NODE_ENV === 'test') {
  require('./runApp').runApp(appName, { args, forked: !!process.env['CORE_FORK'] })
} else {
  import('tsx').then(() => require('./runApp').runApp(appName, { args, forked: !!process.env['CORE_FORK'] }))
}
