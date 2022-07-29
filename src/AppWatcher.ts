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

  public constructor(appName: string, args: Record<string, any>, ignore: string[] = []) {
    super()
    this.appName = appName
    this.args = args
    this.ignore = ignore
  }

  /** Starts the watcher and forks the app running the runApp.script file  */
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
        if (this.currentChildProcess) {
          // if the forked app is still in a state that can be terminated we just terminated its
          this.currentChildProcess.kill('SIGTERM')

          // Internally ALRM will recognize we try to reload
          this.currentChildProcess.kill('SIGALRM')
          this.emit('restart', [`${event} ${path}`])
        }
      })
      .on('ready', (): void => {
        this.spawnSubProcess()
        this.emit('ready')
      })
  }

  /** Stops watcher and sends the ABRT signal */
  public stop(): void {
    this.stopping = true

    this.watcher.close()

    if (this.currentChildProcess) {
      this.currentChildProcess.kill('SIGTERM')
      this.currentChildProcess.kill('SIGABRT')
    }
  }

  /** Sends the ABRT signal */
  public kill(): void {
    if (this.currentChildProcess) {
      this.currentChildProcess.kill('SIGTERM')
      this.currentChildProcess.kill('SIGABRT')
    }
  }

  /** Forks to a new process that run the apps en a demonized way */
  private async spawnSubProcess(): Promise<void> {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      CORE_APP_NAME: this.appName,
      CORE_APP_ARGS: JSON.stringify(this.args),
      CORE_DEMON: 'true'
    }

    this.currentChildProcess = fork(path.resolve(__dirname, 'runApp.script.ts'), { env, stdio: ['ipc', 'inherit', 'inherit'] })

    this.currentChildProcess.on('exit', (): void => {
      if (!this.stopping) {
        this.spawnSubProcess()
      }
    })
  }
}
