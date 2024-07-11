# Core

[![npm version](https://badge.fury.io/js/@universal-packages%2Fcore.svg)](https://www.npmjs.com/package/@universal-packages/core)
[![Testing](https://github.com/universal-packages/universal-core/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-core/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-core/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-core)

Universal Core is a generic framework to run any kind of node application in a conventional way, it can be anything, a web server, a background jobs worker, a web sockets server, a game runner, whatever you want. You just build the entry point as a CoreApp class and the universal core cli runner will take care of the rest.

## Install

To initialize a core project you can use the cli by running

```shell
npx @universal-packages/core new my-app
```

To initialize a typescript project use the flag `-ts`

```shell
npx @universal-packages/core new my-app --ts
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

### new

```shell
ucore new <project-name> <--ts|--typescript>?
```

Initialize a new project in its own directory, install packages and inits git for you.

Example:

```shell
ucore new web-app
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

### initialize

```
ucore initialize <initializer-name> <--ts|--typescript>?
```

If a universal core library offers some kind of initializer you can use this command to initialize it in your project, `<initializer-name>` is the name of the library you want to initialize, it will may provide a typescript template that will be populated.

Example:

```
ucore initialize some-core-library --typescript
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
  apps:
    location: ./src/apps

development:
  apps:
    watcher:
      enabled: true
      ignore:
        - tests
  logger:
    level: TRACE
    terminal:
      clear: true
```

As you can see you can provide configuration depending on the environment you are running or in other words depending what `NODE_ENV` value is set.

### Config

- **`apps`** `map`

  - **`location`** `string` `default: ./src`
    Where core should look for app modules to load.
  - **`watcher`** `map`
    - **`enabled`** `boolean` `default: false`
      Should the runner watch your project for changes and reload the app on the fly?.
    - **`ignore`** `string[]`
      Which files and folders should the watcher ignore.

- **`config`** `map`

  - **`location`** `string` `default: ./src/config`
    Where all the project config is.

- **`environments`** `map`

  - **`location`** `string` `default: ./src`
    Where all your environments are.

- **`modules`** `map`

  - **`asGlobals`** `boolean` `default: true`
    All modules will be available in the global scope like `myCustomModule`.
  - **`location`** `string` `default: ./src`
    Where all your custom modules are.

- **`tasks`** `map`

  - **`location`** `string` `default: ./src`
    Where all your custom tasks are.

- **`logger`** `map`
  See [Logger Options](https://github.com/universal-packages/universal-logger?tab=readme-ov-file#options)

- **`terminalPresenter`** `map`
  See [Terminal Presenter Options](https://github.com/universal-packages/universal-terminal-presenter?tab=readme-ov-file#options)

## Core Module

Core modules need to be built as a conventional class with some required and optional methods. Modules are meant to be a modularized piece of logic that provides encapsulated capabilities to be used all across the project. If possible and in case the user want modules to be shared globally, a `subject` property needs to be set for core to set it as a global, in the example below a `redisSubject` global variable equal to the `subject` property will be set.

```js
import { CoreModule } from '@universal-packages/core'
import ActualRedis from 'some-good-redis-lib'

export default class RedisModule extends CoreModule {
  static moduleName = 'redis-module'
  static description = 'Redis encapsulation'
  static defaultConfig = { port: 3789 }
  static environment = 'production'
  static onlyFor = 'apps'
  static tideTo = 'web-server-app'

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

#### **`moduleName`** `String`

Name to be used when loading an collecting modules, internally this is preferred before using the class name, module names will be used to name the subject when globals are enabled, try to follow a convention to use `module` at the end of your module name, for example `redis-module`, this way your global subject will be called `redisSubject`, you can still name it what ever you want and `subject` will be appended at the end of the module name.

#### **`description`** `String`

Quick explanation of what your modules provides.

#### **`defaultConfig`** `String`

Before core passed the configuration loaded to this module it can optionally grab this default configuration and merge it with the loaded one, normally used to avoid errors while configuring the subject.

#### **`environment`** `String | String[]`

If specified the module will only be loaded if `NODE_ENV` matches one of the values, for instance the example above will only be loaded when `NODE_ENV` is equal to `production`, another example will be to set it like `static environment = ['production', 'staging']` to only be ran in those.

It is also supported negated environments, for instance `static environment = '!development'` will be loaded in any environment except development.

#### **`onlyFor`** `'apps' | 'tasks' | 'console'`

If specified the environment will only be loaded if the process type matches, for instance the example above will only be loaded if we are running an app, another example will be to set it like `static onlyFor = ['apps', 'console']` to only be ran in those.

#### **`tideTo`** `String | String[]`

If specified the environment will only be loaded if the process name matches, for instance the example above will only be loaded if we are running an app called `web-server-app`, another example will be to set it like `static tideTo = ['web-server-app', 'worker-app']` to only be ran in those.

### Instance properties

#### **`config`** `Object`

Use the config passed to this instance via this Module's configuration file via `this.config` the configuration file should be named the same as your module's name `./src/config/custom-module.yaml | json | js | ts`

#### **`logger`** `Logger`

A logger will be passed to the environment to be used accessed as `this.logger`

#### **`subject`** `Any`

Set this if you want core to set it as a global to use, normally modules abstract a subject and normalize it to shared across the app through a subject.

### Instance methods (Module life cycle)

#### **`prepare()`** `required`

Modules are loaded before the app or task are loaded, so they can access all modules to prepare themselves.
Every time a module is loaded its prepare method will be called for instantiation, so all sorts of preparations can be made to leave the module ready to be used across the project.

#### **`release()`** `required`

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
    this.logger.log({ level: 'INFO', title: 'Web app has started' })
  }

  async stop() {
    await this.webServer.stop()
    this.logger.log({ level: 'INFO', title: 'Web app has stopped' })
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

#### **`appName`** `String`

Name to be used when finding an app to run, internally this is preferred before using the class name.

#### **`description`** `String`

Quick explanation of what your app provides.

#### **`defaultConfig`** `String`

Before core passed the configuration loaded to this app it can optionally grab this default configuration and merge it with the loaded one, normally used to avoid errors.

#### **`allowAppWatch`** `boolean` `default: true`

If your apps provides its own way to reload itself when a file changes you can set this to `false` to avoid conflicts with the core watcher. This overrides the watcher configuration in the core configuration file.

### Instance properties

#### **`config`** `Object`

Use the config passed to this instance via this App's configuration file via `this.config` the configuration file should be named the same as your app's name `./src/config/example-app.yaml | json | js | ts`

#### **`logger`** `Logger`

A logger will be passed to the environment to be used accessed as `this.logger`

#### **`args`** `oBJECT`

Any params passed via command line will be passed to the app instance and can be accessed via `this.args`

```
ucore run example-app -p 80000
                      |       |
                        args
```

### Instance methods (App life cycle)

#### **`prepare()`** `optional`

When core loads your app, it will call this method so you can prepare any custom stuff you need to prepare in order for your app to run smoothly. Core modules are already loaded at this point so feel free to use them. Sometimes you just want custom stuff to happen before starting the app.

#### **`run()`** `required`

Once all modules have been loaded as well as your app prepared, this method is called, here you can start listening for connections, or start a worker, or any kind of whatever, after all, a core app is meant to be use in a universal
way.

#### **`stop()`** `required`

After pressing `CTRL+C` universal core will call this method so you can start shutting down your app gracefully, starting draining sockets or whatever.

#### **`release()`** `optional`

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

#### **`taskName`** `String`

Name to be used when finding an task to exec, internally this is preferred before using the class name.

#### **`description`** `String`

Quick explanation of what your task does.

### Instance properties

#### **`this.directive, this.directiveOptions`** `String, String[]`

For tasks instead of loading a configuration in the `this.config` instance property the task executioner will pass a directive and directiveOptions and these can be accessed via `this.directive` `this.directiveOptions`.

```
ucore exec send-emails-task hola admins
                            |   | |   |
                            ----- -----
                            |       |
                        directive  directiveOptions ['admins']
```

#### **`this.args`** `Object`

Any params passed via command line will be passed to the app instance and can be accessed via `this.args`

```
ucore exec send-emails-task hola admins --fast
                                        |       |
                                          args
```

#### **`this.logger`** `Logger`

You can use the core project logger passed to the instance via `this.logger`.

### Instance methods (Task life cycle)

#### **`exec()`** `required`

Once all is loaded and prepared exec any kind of whatever. Some data migration or a bulk email sending or whatever.

#### **`abort()`** `optional`

After pressing `CTRL+C` universal core will optionally call this method, if you have a way to stop your task do it here so the execution can be stopped gracefully.

> If your exec method is just a loop you can set here a `this.stopping = true` property.

## Core Initializers

When building a universal core library you can provide an initializer to help users to start using your library, initializers are meant to be ran once and they can be used to setup a project with some boilerplate code.

If your library provides some boilerplate code you can place your templates in a `templates` folder in the same directory as your initializer file.

```shell
- universal-core-easy-mailing
  |- src
    |- easy-mailing.universal-core-initializer.js
    |- templates
      |- default
        |- source
          |- mailing
            |- Example.mailer.js
          |- config
            |- easy-mailing-module.yaml
      |- typescript
        |- source
          |- mailing
            |- Example.mailer.ts
          |- config
            |- easy-mailing-module.yaml
        |- root
          |- tsconfig.json
```

Thats the only thing you need to do, all core initializers will populate the templates.

If you need to do some custom stuff you can do it in the `initialize` protected method.

```js
import { CoreInitializer } from '@universal-packages/core'

export default class EasyMailingInitializer extends CoreInitializer {
  static initializerName = 'easy-mailing'
  static description = 'Easy mailing initialization, sets up some stuff for you'

  // This is always required so that knows where to find the templates
  readonly templatesLocation: string = `${__dirname}/templates`

  async beforeTemplatePopulate() {
    // Do some custom stuff before the templates are populated
  }

  async afterTemplatePopulate() {
    // Do some custom stuff after the templates are populated
  }

  async abort() {
    // If the user aborts the initialization process, you can gracefully stop it here
  }
}
```

### Static properties

#### **`initializerName`** `String`

Name to be used when finding an initializer to run, internally this is preferred before using the class name.

#### **`description`** `String`

Quick explanation of what your initializer does.

#### **`this.args`** `Object`

Any params passed via command line will be passed to the app instance and can be accessed via `this.args`

```
ucore initialize easy-mailing --gmail
                             |       |
                                args
```

#### **`this.typescript`** `boolean`

If the user passed the `--typescript` flag this property will be set to `true`.

```
ucore initialize easy-mailing --typescript
                             |             |
                                typescript
```

#### **`this.sourceLocation`** `string`

If the user passed the `--source` to a different source location this property will be set to the value.

```
ucore initialize easy-mailing --source ./code
                             |                |
                               sourceLocation
```

#### **`this.templatesLocation`** `string`

This always needs to be set to the location of the templates folder. So that the automatic population knows where to find the templates.

#### **`this.logger`** `Logger`

You can use the core project logger passed to the instance via `this.logger`.

### Instance methods (Initializer life cycle)

#### **`initialize()`** `optional`

This will be called after the templates have been populated, you can do some custom stuff here.

#### **`rollback()`** `optional`

After pressing `CTRL+C` universal core will optionally call this method, if you have a way to stop your initialization process do it here so the execution can be stopped gracefully.

> If your initialize method is just a loop you can set here a `this.stopping = true` property.

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

#### **`environment`** `String | String[]`

If specified the environment will only be loaded if `NODE_ENV` matches one of the values, for instance the example above will only be loaded when `NODE_ENV` is equal to `production`, another example will be to set it like `static environment = ['production', 'staging']` to only be ran in those.

It is also supported negated environments, for instance `static environment = '!development'` will be loaded in any environment except development.

#### **`onlyFor`** `'apps' | 'tasks' | 'console'`

If specified the environment will only be loaded if the process type matches, for instance the example above will only be loaded if we are running an app, another example will be to set it like `static onlyFor = ['apps', 'console']` to only be ran in those.

#### **`tideTo`** `String | String[]`

If specified the environment will only be loaded if the process name matches, for instance the example above will only be loaded if we are running an app called `web-server-app`, another example will be to set it like `static tideTo = ['web-server-app', 'worker-app']` to only be ran in those.

### Instance properties

#### **`logger`** `Logger`

A logger will be passed to the environment to be used accessed as `this.logger`

### Instance methods (event callbacks)

#### **`beforeModulesLoad()`**

Use it when you want to stuff to happen right before modules are loaded.

#### **`afterModulesLoad()`**

Use it when you want to stuff to happen right after modules were loaded.

#### **`beforeAppPrepare()`**

Use it when you want to stuff to happen right before app prepare method is called.

#### **`afterAppPrepare()`**

Use it when you want to stuff to happen right after app has been prepared.

#### **`beforeAppRuns()`**

Use it when you want to stuff to happen right before app run method is called.

#### **`afterAppRuns()`**

Use it when you want to stuff to happen right after app has been ran and is up.

#### **`beforeTaskExec()`**

Use it when you want to stuff to happen right before task exec method is called.

#### **`afterTaskExec()`**

Use it when you want to stuff to happen right after task exec method finishes.

#### **`beforeConsoleRuns()`**

Use it when you want to stuff to happen right before console starts running.

#### **`afterConsoleRuns()`**

Use it when you want to stuff to happen right after console has been ran and is active.

#### **`beforeAppStops()`**

Use it when you want to stuff to happen right before app stop method is called.

#### **`afterAppStops()`**

Use it when you want to stuff to happen right after app has been stopped.

#### **`beforeTaskAborts()`**

Use it when you want to stuff to happen right before task abort method is called.

#### **`afterTaskAborts()`**

Use it when you want to stuff to happen right after task abort method was called (Is stopping probably?).

#### **`afterConsoleStops()`**

Use it when you want to stuff to happen right after console is being exited.

#### **`beforeAppRelease()`**

Use it when you want to stuff to happen right before app release method is called.

#### **`afterAppRelease()`**

Use it when you want to stuff to happen right after app has been released.

#### **`beforeModulesRelease()`**

Use it when you want to stuff to happen right before modules are released.

#### **`afterModulesRelease()`**

Use it when you want to stuff to happen right after modules have been released.

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
