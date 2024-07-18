import { Logger } from '@universal-packages/logger'
import { SubProcess } from '@universal-packages/sub-process'
import { paramCase } from 'change-case'
import path from 'path'

import { CoreInitializer } from './'
import { LOG_CONFIGURATION } from './common/terminal-presenter/LOG_CONFIGURATION'

export default class CoreProjectInitializer extends CoreInitializer {
  public static readonly initializerName = 'universal-core-project'
  public static readonly description: string = 'Universal Core Project Initializer'

  public readonly templatesLocation: string = `${__dirname}/templates`

  protected readonly operationLocation: string

  private currentSubProcess: SubProcess
  private stopping: boolean = false

  private readonly paramCaseName: string

  public constructor(args: any, logger: Logger) {
    super(args, logger)

    this.paramCaseName = paramCase(args.projectName || 'universal-core-project')
    this.operationLocation = `./${this.paramCaseName}`
  }

  protected async beforeTemplatePopulate(): Promise<void> {
    let coreVersion = '1.0.0'

    try {
      coreVersion = (await import(path.resolve(__dirname, 'package.json'))).version
    } catch (_) {
      coreVersion = (await import(path.resolve(__dirname, '..', 'package.json'))).version
    }

    this.templateVariables.projectName = this.paramCaseName
    this.templateVariables.coreVersion = `^${coreVersion}`
  }

  protected async afterTemplatePopulate(): Promise<void> {
    core.developer.terminalPresenter.setProgressPercentage(20)

    this.logger.log({ level: 'INFO', title: 'Project template has been initialized.', category: 'CORE' }, LOG_CONFIGURATION)
    this.logger.log({ level: 'INFO', title: 'Installing dependencies...', category: 'CORE' }, LOG_CONFIGURATION)

    core.developer.terminalPresenter.startProgressIncreaseSimulation(50, 37000)

    const currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'npm', args: ['install'], workingDirectory: this.operationLocation })

    await currentSubProcess.run()

    if (this.stopping) return

    core.developer.terminalPresenter.finishProgressIncreaseSimulation()

    this.logger.log({ level: 'INFO', title: 'Dependencies have been installed.', category: 'CORE' }, LOG_CONFIGURATION)
    this.logger.log({ level: 'INFO', title: 'Initializing git repository...', category: 'CORE' }, LOG_CONFIGURATION)

    core.developer.terminalPresenter.startProgressIncreaseSimulation(30, 1000)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'git init && git add . && git commit -m "init core"',
      workingDirectory: this.operationLocation
    })

    await this.currentSubProcess.run()

    if (this.stopping) return

    core.developer.terminalPresenter.finishProgressIncreaseSimulation()

    this.logger.log({ level: 'INFO', title: 'Git repository has been initialized.', category: 'CORE' }, LOG_CONFIGURATION)
  }

  public async abort(): Promise<void> {
    this.stopping = true
    core.developer.terminalPresenter.finishProgressIncreaseSimulation()
    if (this.currentSubProcess) await this.currentSubProcess.kill()
    await core.developer.terminalPresenter.runSubProcess({ command: 'rm', args: ['-rf', this.operationLocation] })
  }
}
