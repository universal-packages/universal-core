import yargs, { ArgumentsCamelCase, Argv } from 'yargs'

import { execTask } from './execTask'
import { initProject } from './initProject'
import { runApp } from './runApp'
import { runConsole } from './runConsole'

interface ArgvExtract {
  appName: string
  taskName: string
  taskDirective: string
  directiveOptions: string[]
  options: ArgumentsCamelCase
  projectName: string
}

yargs
  .usage('Usage: $0 <command>')
  .command({
    command: 'run <app-name>',
    aliases: 'r',
    describe: 'Runs a named app',
    builder: (yargs: Argv) => yargs.positional('app-name', { description: 'Name of the app to run', type: 'string', demandOption: true }),
    handler: (argv: ArgumentsCamelCase) => {
      const argvExtract = processArgv(argv)
      runApp(argvExtract.appName, argvExtract.options)
    }
  })
  .command({
    command: 'exec <task-name> [task-directive] [directive-options...]',
    aliases: 'e',
    describe: 'Execs a named task',
    builder: (yargs: Argv) =>
      yargs
        .positional('task-name', { description: 'Name of the task to run', type: 'string', demandOption: true })
        .positional('task-directive', { description: 'Task behavior directive', type: 'string' })
        .positional('directive-options', { description: 'Any options unsupported by the task directive' }),
    handler: (argv: ArgumentsCamelCase) => {
      const argvExtract = processArgv(argv)
      execTask(argvExtract.taskName, argvExtract.taskDirective, argvExtract.directiveOptions, argvExtract.options)
    }
  })
  .command({
    command: 'console',
    aliases: 'c',
    describe: 'Runs a ts console with all relevant globals',
    handler: (argv: ArgumentsCamelCase) => {
      processArgv(argv)
      runConsole()
    }
  })
  .command({
    command: 'init <project-name>',
    aliases: 'i',
    describe: 'Inits a new core project',
    builder: (yargs: Argv) =>
      yargs
        .positional('project-name', { description: 'Name to give to the core project', type: 'string', demandOption: true })
        .options('typescript', { alias: ['ts'], description: 'Inits the core project using the typescript template', type: 'boolean', default: false }),
    handler: (argv: ArgumentsCamelCase) => {
      const argvExtract = processArgv(argv)
      initProject(argvExtract.projectName, argvExtract.options)
    }
  })
  .options('env', { alias: ['environment'], description: 'Set node env environment', type: 'string', default: 'development' })
  .demandCommand(1, '')
  .help('h')
  .alias('h', 'help')
  .showHelpOnFail(true)
  .epilog('universal-packages 2022').argv

function processArgv(argv: ArgumentsCamelCase): ArgvExtract {
  const changeEnv = ((argv.environment as string) !== 'development' && process.env['NODE_ENV'] === 'development') || process.env['NODE_ENV'] === undefined

  if (changeEnv) {
    process.env['NODE_ENV'] = argv.environment as string
  }

  const appName = argv['appName'] as string
  const taskName = argv['taskName'] as string
  const taskDirective = argv['taskDirective'] as string
  const directiveOptions = argv['directiveOptions'] as string[]
  const projectName = argv['projectName'] as string

  // Just so options are clean from not relevant args
  const options = { ...argv }
  delete options.$0
  delete options._
  delete options['env']
  delete options['environment']
  delete options['appName']
  delete options['app-name']
  delete options['taskName']
  delete options['task-name']
  delete options['task-directive']
  delete options['taskDirective']
  delete options['task-options']
  delete options['directiveOptions']
  delete options['directive-options']
  delete options['projectName']
  delete options['project-name']

  return { appName, taskName, taskDirective, directiveOptions, options, projectName }
}
