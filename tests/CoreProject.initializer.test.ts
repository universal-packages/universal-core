import { Logger } from '@universal-packages/logger'
import { SubProcess } from '@universal-packages/sub-process'

import { runInitializer } from '../src'
import CoreProjectInitializer from '../src/CoreProject.universal-core-initializer'

jest.mock('@universal-packages/template-populator')

jest.spyOn(process, 'exit').mockImplementation(((): void => {}) as any)

describe(CoreProjectInitializer, (): void => {
  it('initialize packages and git after template population', async (): Promise<void> => {
    await runInitializer('universal-core-project', { args: { projectName: 'my-app' } })

    expect(SubProcess).toHaveRun({ command: 'npm', args: ['install'], workingDirectory: './my-app' })
    expect(SubProcess).toHaveRun({ command: 'git', args: ['init', '&&', 'git', 'add', '.', '&&', 'git', 'commit', '-m', '"init', 'core"'], workingDirectory: './my-app' })

    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core config loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Initializing universal-core-project...', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Project template has been initialized.', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Installing dependencies...', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Dependencies have been installed.', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Initializing git repository...', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Git repository has been initialized.', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'universal-core-project initialized', category: 'CORE' })
  })
})
