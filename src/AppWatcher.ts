import { fork, ChildProcessWithoutNullStreams } from 'child_process'
import chokidar, { FSWatcher } from 'chokidar'
import path from 'path'
import EventEmitter from 'events'

export default class AppWatcher extends EventEmitter {
  private appName: string
  private args: Record<string, any>
  private ignore: string[]

  private watcher: FSWatcher
  private currentChildProcess: ChildProcessWithoutNullStreams
  private stopping: boolean
  private restarting: boolean

  public constructor(appName: string, args: Record<string, any>, ignore: string[] = []) {
    super()
    this.appName = appName
    this.args = args
    this.ignore = ignore
  }

  public run(): void {
    this.watcher = chokidar
      .watch('.', {
        ignored: [
          ...this.ignore,
          /^node_modules/g,
          /^\.git/g,
          /^coverage/,
          /^tests/g,
          /^test/g,
          (entry: string): boolean => {
            const extension = path.extname(entry)
            return !(!extension || ['.ts', '.js', '.json', '.yaml', '.yml'].includes(extension))
          }
        ]
      })
      .on('all', (event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', path: string): void => {
        if (this.currentChildProcess && !this.restarting) {
          this.currentChildProcess.kill('SIGALRM')
          this.restarting = true
          this.emit('restart', [`${event} ${path}`])
        }
      })
      .on('ready', (): void => {
        this.spawnSubProcess()
      })
  }

  public stop(): void {
    this.stopping = true

    if (this.currentChildProcess) {
      this.currentChildProcess.kill('SIGABRT')
    }
  }

  public kill(): void {
    if (this.currentChildProcess) {
      this.currentChildProcess.kill('SIGABRT')
    }
  }

  private async spawnSubProcess(): Promise<void> {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      CORE_APP_NAME: this.appName,
      CORE_APP_ARGS: JSON.stringify(this.args),
      CORE_DEMON: 'true'
    }

    this.currentChildProcess = fork(path.resolve(__dirname, 'startApp.script.ts'), { env, stdio: ['ipc', 'inherit', 'inherit'] })

    this.currentChildProcess.on('exit', (): void => {
      if (this.stopping) {
        this.watcher.close()
      } else {
        this.restarting = false
        this.spawnSubProcess()
      }
    })
  }
}
