import yargs, { ArgumentsCamelCase, Argv } from 'yargs'

import { execTask } from './execTask'
import { runApp } from './runApp'
import { runConsole } from './runConsole'
import { runInitializer } from './runInitializer'

interface ArgvExtract {
  appName: string
  taskName: string
  initializerName: string
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
      runApp(argvExtract.appName, { args: argvExtract.options })
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
        .positional('directive-options', { description: 'Any options supported by the task directive' }),
    handler: (argv: ArgumentsCamelCase) => {
      const argvExtract = processArgv(argv)
      execTask(argvExtract.taskName, { args: argvExtract.options, directive: argvExtract.taskDirective, directiveOptions: argvExtract.directiveOptions })
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
    command: 'initialize <initializer-name>',
    aliases: 'i',
    describe: 'Runs a named core initializer that will set up a core library',
    builder: (yargs: Argv) =>
      yargs
        .positional('initializer-name', { description: 'Name of the core initializer', type: 'string', demandOption: true })
        .options('source', { alias: ['src'], description: 'Main directory in the project', type: 'string', default: './src' })
        .options('typescript', { alias: ['ts'], description: 'Tells the initializer to use the typescript template if available', type: 'boolean', default: false }),
    handler: (argv: ArgumentsCamelCase) => {
      const argvExtract = processArgv(argv)
      runInitializer(argvExtract.initializerName, { args: argvExtract.options })
    }
  })
  .command({
    command: 'new <project-name>',
    aliases: 'n',
    describe: 'Creates a new core project',
    builder: (yargs: Argv) =>
      yargs
        .positional('project-name', { description: 'Name to give to the core project', type: 'string', demandOption: true })
        .options('typescript', { alias: ['ts'], description: 'Inits the core project using the typescript template', type: 'boolean', default: false }),
    handler: (argv: ArgumentsCamelCase) => {
      const argvExtract = processArgv(argv)
      runInitializer('universal-core-project', { args: { ...argvExtract.options, projectName: argvExtract.projectName } })
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
  const initializerName = argv['initializerName'] as string
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
  delete options['initializerName']
  delete options['initializer-name']
  delete options['task-directive']
  delete options['taskDirective']
  delete options['task-options']
  delete options['directiveOptions']
  delete options['directive-options']
  delete options['projectName']
  delete options['project-name']

  return { appName, taskName, initializerName, taskDirective, directiveOptions, options, projectName }
}
