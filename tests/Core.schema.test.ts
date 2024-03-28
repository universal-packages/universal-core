import { Core } from '../src'

const scenarios = [
  { name: 'apps-1', config: { apps: 'nop' }, errors: ['/apps must be object'] },
  { name: 'apps-2', config: { apps: { location: 55 } }, errors: ['/apps/location must be string'] },
  { name: 'apps-2', config: { apps: { watcher: 'nop' } }, errors: ['/apps/watcher must be object'] },
  { name: 'apps-3', config: { apps: { watcher: { enabled: 'nop' } } }, errors: ['/apps/watcher/enabled must be boolean'] },
  { name: 'apps-4', config: { apps: { watcher: { ignore: 'nop' } } }, errors: ['/apps/watcher/ignore must be array'] },
  { name: 'apps-5', config: { apps: { watcher: { ignore: [55] } } }, errors: ['/apps/watcher/ignore/0 must be string'] },
  { name: 'config-1', config: { config: 'nop' }, errors: ['/config must be object'] },
  { name: 'config-2', config: { config: { location: 55 } }, errors: ['/config/location must be string'] },
  { name: 'environments-1', config: { environments: 'nop' }, errors: ['/environments must be object'] },
  { name: 'environments-2', config: { environments: { location: 55 } }, errors: ['/environments/location must be string'] },
  { name: 'modules-1', config: { modules: 'nop' }, errors: ['/modules must be object'] },
  { name: 'modules-2', config: { modules: { asGlobals: 'nop' } }, errors: ['/modules/asGlobals must be boolean'] },
  { name: 'modules-3', config: { modules: { location: 55 } }, errors: ['/modules/location must be string'] },
  { name: 'tasks-1', config: { tasks: 'nop' }, errors: ['/tasks must be object'] },
  { name: 'tasks-2', config: { tasks: { location: 55 } }, errors: ['/tasks/location must be string'] },
  { name: 'terminalPresenter-1', config: { terminalPresenter: 'nop' }, errors: ['/terminalPresenter must be object'] },
  { name: 'terminalPresenter-2', config: { terminalPresenter: { clear: 'nop' } }, errors: ['/terminalPresenter/clear must be boolean'] },
  { name: 'terminalPresenter-3', config: { terminalPresenter: { decorateConsole: 'nop' } }, errors: ['/terminalPresenter/decorateConsole must be boolean'] },
  { name: 'terminalPresenter-4', config: { terminalPresenter: { enabled: 'nop' } }, errors: ['/terminalPresenter/enabled must be boolean'] },
  { name: 'terminalPresenter-5', config: { terminalPresenter: { framesPerSecond: 'nop' } }, errors: ['/terminalPresenter/framesPerSecond must be number'] },
  { name: 'logger-1', config: { logger: 'nop' }, errors: ['/logger must be object'] },
  {
    name: 'logger-2',
    config: { logger: { level: 55 } },
    errors: [
      '/logger/level must be string\n/logger/level must be equal to one of the allowed values ["FATAL","ERROR","WARNING","QUERY","INFO","DEBUG","TRACE"]\n/logger/level must be array\n/logger/level must match exactly one schema in oneOf'
    ]
  },
  {
    name: 'logger-3',
    config: { logger: { level: [55] } },
    errors: [
      '/logger/level must be string\n/logger/level must be equal to one of the allowed values ["FATAL","ERROR","WARNING","QUERY","INFO","DEBUG","TRACE"]\n/logger/level/0 must be string\n/logger/level/0 must be equal to one of the allowed values ["FATAL","ERROR","WARNING","QUERY","INFO","DEBUG","TRACE"]\n/logger/level must match exactly one schema in oneOf'
    ]
  },
  { name: 'logger-4', config: { logger: { silence: 'nop' } }, errors: ['/logger/silence must be boolean'] },
  { name: 'logger-5', config: { logger: { transports: 'nop' } }, errors: ['/logger/transports must be array'] },
  {
    name: 'logger-6',
    config: { logger: { transports: [55] } },
    errors: ['/logger/transports/0 must be string\n/logger/transports/0 must be object\n/logger/transports/0 must match exactly one schema in oneOf']
  },
  {
    name: 'logger-7',
    config: { logger: { transports: [{ transport: 55 }] } },
    errors: ['/logger/transports/0 must be string\n/logger/transports/0/transport must be string\n/logger/transports/0 must match exactly one schema in oneOf']
  },
  {
    name: 'logger-8',
    config: { logger: { transports: [{ other: 'nop' }] } },
    errors: ["/logger/transports/0 must be string\n/logger/transports/0 must have required property 'transport'\n/logger/transports/0 must match exactly one schema in oneOf"]
  },
  { name: 'logger-9', config: { logger: { filterMetadataKeys: 'nop' } }, errors: ['/logger/filterMetadataKeys must be array'] },
  { name: 'logger-10', config: { logger: { filterMetadataKeys: [55] } }, errors: ['/logger/filterMetadataKeys/0 must be string'] }
]

describe(Core, (): void => {
  for (const scenario of scenarios) {
    describe(`Bad core config scenario: ${scenario.name}`, (): void => {
      it(`throws an error indicating the problem`, async (): Promise<void> => {
        let error: Error

        try {
          await Core.getCoreConfig(scenario.config as any)
        } catch (err) {
          error = err
        }

        expect(error.message).toBe(`Core config is invalid:\n\n${scenario.errors.join('\n')}`)
      })
    })
  }
})
