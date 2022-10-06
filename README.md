# Core

[![npm version](https://badge.fury.io/js/@universal-packages%2Fcore.svg)](https://www.npmjs.com/package/@universal-packages/core)
[![Testing](https://github.com/universal-packages/universal-core/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-core/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-core/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-core)

Universal Core is a generic framework to run any kind of node application in a conventional way, it can be anything, a web server, a background jobs worker, a web sockets server, a game runner, whatever you want. You just build the entry point as a CoreApp class and the universal core cli runner will take care of the rest.

## Install

To initialize a core project you can use the cli by running

```shell
npx @universal-packages/core init my-new-app
```

To initialize a typescript project use the flag `-ts`

```shell
npx @universal-packages/core init my-new-app --ts
```

You will end up with the following structure

```
- my-new-app
  |- src
    |- config  // All the configuration goes here
    |- modules // All custom modules go here
    |- tasks // All custom tasks go here
    |- example.app.js|ts // Example app so you know what's up
  |- core.yaml
```

Alternatively you can start from scratch installing this package

```shell
npm install @universal-packages/core
```

## CLI

The universal core cli is very simple and your entry point to run universal core projects.

### init

```shell
ucore init <project-name> <--ts|--typescript>?
```

Initialize a new project directly in the current working directory, install packages and inits git for you.

Example:

```shell
ucore init web-app
```

### run

```
ucore run <app-name> <options>
```

Loads core config, loads project configuration, loads all available modules and runs an universal core application, `<options>` are arbitrary args that may be used by the app.

Example:

```
ucore run server -p 3002 -h localhost
```

### exec

```
ucore exec <task-name> <task-directive> <task-options> <options>
```

Loads core config, loads project configuration, loads all available modules and runs an universal core task, `<options>` are arbitrary args that may be used by the task.

Example:

```
ucore exec database-task generate-migration create-users-table --fast
```

### console

```
ucore console
```

Loads core config, loads project configuration, loads all available modules and runs an interactive console.

## Core Configuration

In order for the universal core to find and load everything smoothly you need to provide a core configuration file at the root of your project.

Example:

```
default:
  appsLocation: './src/apps'

development:
  appWatcher:
    enabled: true
    ignore:
      - tests
  logger:
    level: TRACE
    terminal:
      clear: true

test:
  logger:
    silence: true
```

As you can see you can provide configuration depending on the environment you are running or in other words depending what `NODE_ENV` value is set.

### Config

- **`appsLocation`** `string` `default: ./src`
  Where core should look for app modules to load.

- **`appWatcher`** `map`

  - **`enabled`** `boolean` `default: false`
    Should the runner watch your project for changes and reload the app on the fly?.
  - **`ignore`** `string[]`
    Which files and folders should the watcher ignore.

- **`configLocation`** `string` `default: ./src/config`
  Where all the project config is.

- **`environmentsLocation`** `string` `default: ./src`
  Where all your environments are.

- **`modulesLocation`** `string` `default: ./src/modules`
  Where all your custom modules are.

- **`modulesAsGlobals`** `boolean` `default: true`
  All modules will be available in the global scope like `myCustomModule`.

- **`tasksLocation`** `boolean` `default: ./src/tasks`
  Where all your custom tasks are.

- **`logger`** `map`
  - **`level`** `'FATAL' | 'ERROR' | 'WARNING' | 'QUERY' | 'INFO' | 'DEBUG' | 'TRACE'` `default: INFO`
    Log level for the main Logger.
  - **`silence`** `boolean` `default: false`
    Should the logger be silenced since the beginning.
  - **`terminal`** `map`
    - **`enable`** `boolean` `default: true`
      Should the logger use the terminal transport.
    - **`clear`** `boolean` `default: false`
      Should the logger clear the terminal before start logging.
    - **`withHeader`** `boolean` `default: false`
      Should the logger print a header for every entry.
  - **`localFile`** `map`
    - **`enable`** `boolean` `default: true`
      Should the logger use the localFile transport.
    - **`asJson`** `boolean` `default: false`
      Should the log entries in the file be serialized into JSON.
    - **`localFile`** `string` `default: ./logs`
      Where should the file with logs be created?

## Core Module

Core modules need to be built as a conventional class with some required and optional methods. Modules are meant to be a modularized piece of logic that provides encapsulated capabilities to be used all across the project. If possible and in case the user want modules to be shared globally, a `subject` property needs to be set for core to set it as a global, in the example below a `redisSubject` global variable equal to the `subject` property will be set.

```js
import { CoreModule } from '@universal-packages/core'
import ActualRedis from 'some-good-redis-lib'

export default class RedisModule extends CoreModule {
  static moduleName = 'redis-module'
  static description = 'Redis encapsulation'
  static defaultConfig = { port: 3789 }

  subject = null

  async prepare() {
    this.subject = new ActualRedis(this.config)
    await this.subject.connect()
  }

  async release() {
    await this.subject.disconnect()
  }
}
```

Configuration for this module should be in `./src/config/redis-module.json|yaml|js`

Example:

```yaml
default:
  db: 0
development:
  port: 6379
```

### Static properties

- **`moduleName`** `String`
  Name to be used when loading an collecting modules, internally this is preferred before using the class name, module names will be used to name the subject when globals are enabled, try to follow a convention to use `module` at the end of your module name, for example `redis-module`, this way your global subject will be called `redisSubject`, you can still name it what ever you want and `subject` will be appended at the end of the module name.
- **`description`** `String`
  Quick explanation of what your modules provides.
- **`defaultConfig`** `String`
  Before core passed the configuration loaded to this module it can optionally grab this default configuration and merge it with the loaded one, normally used to avoid errors while configuring the subject.

### Instance properties

- **`config`** `Object`
  Use the config passed to this instance via this Module's configuration file via `this.config` the configuration file should be named the same as your module's name `./src/config/custom-module.yaml | json | js | ts`
- **`logger`** `Logger`
  A logger will be passed to the environment to be used accessed as `this.logger`
- **`subject`** `Any`
  Set this if you want core to set it as a global to use, normally modules abstract a subject and normalize it to shared across the app through a subject.

### Instance methods (Module life cycle)

- **`prepare`** `required`
  Modules are loaded before the app or task are loaded, so they can access all modules to prepare themselves.
  Every time a module is loaded its prepare method will be called for instantiation, so all sorts of preparations can be made to leave the module ready to be used across the project.

- **`release`** `required`
  Modules normally will release any connections to local services such as databases.

## Core Apps

Core apps need to be built as a conventional class with some required and optional methods. Apps are meant to keep alive once running.

```js
import { CoreApp } from '@universal-packages/core'
import { createServer, destroyServer } from 'some-useful-http-server'

export default class WebServer extends CoreApp {
  static appName = 'web-server'
  static description = 'Http server'
  static defaultConfig = { host: 'localhost' }

  webServer = null

  async prepare() {
    // possible core module loaded
    const migrated = await databaseModule.checkMigrations()
    if (!migrated) throw new Error('Migrate db before running')

    this.webServer = await createServer(this.config.serverConfig)
  }

  async run() {
    await this.webServer.start({ port: this.config.port })
    this.logger.publish('INFO', 'Web app has started')
  }

  async stop() {
    await this.webServer.stop()
    this.logger.publish('INFO', 'Web app has stopped')
  }

  async release() {
    await destroyServer(this.webServer)
  }
}
```

Configuration for this app should be in `./src/config/web-server.json|yaml|js`

Example:

```yaml
default:
  serverConfig:
    routes:
      - /users/:id
      - /posts/:id
development:
  port: 3000
```

### Static properties

- **`appName`** `String`
  Name to be used when finding an app to run, internally this is preferred before using the class name.
- **`description`** `String`
  Quick explanation of what your app provides.
- **`defaultConfig`** `String`
  Before core passed the configuration loaded to this app it can optionally grab this default configuration and merge it with the loaded one, normally used to avoid errors.

### Instance properties

- **`config`** `Object`
  Use the config passed to this instance via this App's configuration file via `this.config` the configuration file should be named the same as your app's name `./src/config/example-app.yaml | json | js | ts`
- **`logger`** `Logger`
  A logger will be passed to the environment to be used accessed as `this.logger`
- **`args`** `oBJECT`
  Any params passed via command line will be passed to the app instance and can be accessed via `this.args`

  ```
  ucore run example-app -p 80000
                        |       |
                          args
  ```

### Instance methods (App life cycle)

- **`prepare`** `optional`
  When core loads your app, it will call this method so you can prepare any custom stuff you need to prepare in order for your app to run smoothly. Core modules are already loaded at this point so feel free to use them. Sometimes you just want custom stuff to happen before starting the app.

- **`run`** `required`
  Once all modules have been loaded as well as your app prepared, this method is called, here you can start listening for connections, or start a worker, or any kind of whatever, after all, a core app is meant to be use in a universal
  way.

- **`stop`** `required`
  After pressing `CTRL+C` universal core will call this method so you can start shutting down your app gracefully, starting draining sockets or whatever.

- **`release`** `optional`
  This is the counterpart of `prepare`, use this after your app has stopped to release any resources or custom routines to ensure your app has released everything to finish the process.

## Core Tasks

Core tasks need to be built as a conventional class with some required and optional methods. Tasks are meant to execute once and finish in one go. Tasks does not hold any configuration.

```js
import { CoreTask } from '@universal-packages/core'

export default class SendEmailsTask extends CoreTask {
  static taskName = 'send-emails-task'
  static description = 'Send an email to all our users'

  allUsers = []
  stopping = false

  async exec() {
    for (let i = 0; i < this.allUsers, length; i++) {
      if (this.stopping) return
      await emailModule.send(this.directive, { to: allUsers[i].email })
    }
  }

  async abort() {
    this.stopping = true
  }
}
```

### Static properties

- **`taskName`** `String`
  Name to be used when finding an task to exec, internally this is preferred before using the class name.
- **`description`** `String`
  Quick explanation of what your task does.

### Instance properties

- **`this.directive, this.directiveOptions`** `String, String[]`
  For tasks instead of loading a configuration in the `this.config` instance property the task executioner will pass a directive and directiveOptions and these can be accessed via `this.directive` `this.directiveOptions`.

  ```
  ucore exec send-emails-task hola admins
                              |   | |   |
                              ----- -----
                              |       |
                          directive  directiveOptions ['admins']
  ```

- **`this.args`** `Object`
  Any params passed via command line will be passed to the app instance and can be accessed via `this.args`

  ```
  ucore exec send-emails-task hola admins --fast
                                          |       |
                                            args
  ```

- **`this.logger`** `Logger`
  You can use the core project logger passed to the instance via `this.logger`.

### Instance methods (Task life cycle)

- **`exec`** `required`
  Once all is loaded and prepared exec any kind of whatever. Some data migration or a bulk email sending or whatever.

- **`abort`** `optional`
  After pressing `CTRL+C` universal core will optionally call this method, if you have a way to stop your task do it here so the execution can be stopped gracefully.
  > If your exec method is just a loop you can set here a `this.stopping = true` property.

## CoreEnvironment

Core environment are callback driven pieces of logic, its event callbacks (methods) are going to be called once depending on the sate of the core running or execution process.

```js
import { CoreEnvironment } from '@universal-packages/core'

export default class MyEnvironment extends CoreEnvironment {
  static environment = 'production'
  static onlyFor = 'apps'
  static tideTo = 'web-server-app'

  beforeModulesLoad() {}
  afterModulesLoad() {}

  beforeAppPrepare() {}
  afterAppPrepare() {}

  beforeAppRuns() {}
  afterAppRuns() {}

  beforeTaskExec() {}
  afterTaskExec() {}

  beforeConsoleRuns() {}
  afterConsoleRuns() {}

  beforeAppStops() {}
  afterAppStops() {}

  beforeTaskAborts() {}
  afterTaskAborts() {}

  afterConsoleStops() {}

  beforeAppRelease() {}
  afterAppRelease() {}

  beforeModulesRelease() {}
  afterModulesRelease() {}
}
```

### Static properties

- **`environment`** `String | String[]`
  If specified the environment will only be loaded if `NODE_ENV` matches one of the values, for instance the example above will only be loaded when `NODE_ENV` is equal to `production`, another example will be to set it like `static environment = ['production', 'staging']` to only be ran in those.
- **`onlyFor`** `'apps' | 'tasks' | 'console'`
  If specified the environment will only be loaded if the process type matches, for instance the example above will only be loaded if we are running an app, another example will be to set it like `static onlyFor = ['apps', 'console']` to only be ran in those.
- **`tideTo`** `String | String[]`
  If specified the environment will only be loaded if the process name matches, for instance the example above will only be loaded if we are running an app called `web-server-app`, another example will be to set it like `static tideTo = ['web-server-app', 'worker-app']` to only be ran in those.

### Instance properties

- **`logger`** `Logger`
  A logger will be passed to the environment to be used accessed as `this.logger`

### Instance methods (event callbacks)

- **`beforeModulesLoad`**
  Use it when you want to stuff to happen right before modules are loaded.
- **`afterModulesLoad`**
  Use it when you want to stuff to happen right after modules were loaded.

- **`beforeAppPrepare`**
  Use it when you want to stuff to happen right before app prepare method is called.
- **`afterAppPrepare`**
  Use it when you want to stuff to happen right after app has been prepared.

- **`beforeAppRuns`**
  Use it when you want to stuff to happen right before app run method is called.
- **`afterAppRuns`**
  Use it when you want to stuff to happen right after app has been ran and is up.

- **`beforeTaskExec`**
  Use it when you want to stuff to happen right before task exec method is called.
- **`afterTaskExec`**
  Use it when you want to stuff to happen right after task exec method finishes.

- **`beforeConsoleRuns`**
  Use it when you want to stuff to happen right before console starts running.
- **`afterConsoleRuns`**
  Use it when you want to stuff to happen right after console has been ran and is active.

- **`beforeAppStops`**
  Use it when you want to stuff to happen right before app stop method is called.
- **`afterAppStops`**
  Use it when you want to stuff to happen right after app has been stopped.

- **`beforeTaskAborts`**
  Use it when you want to stuff to happen right before task abort method is called.
- **`afterTaskAborts`**
  Use it when you want to stuff to happen right after task abort method was called (Is stopping probably?).

- **`afterConsoleStops`**
  Use it when you want to stuff to happen right after console is being exited.

- **`beforeAppRelease`**
  Use it when you want to stuff to happen right before app release method is called.
- **`afterAppRelease`**
  Use it when you want to stuff to happen right after app has been released.

- **`beforeModulesRelease`**
  Use it when you want to stuff to happen right before modules are released.
- **`afterModulesRelease`**
  Use it when you want to stuff to happen right after modules have been released.

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
