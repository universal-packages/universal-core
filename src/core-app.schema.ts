import Schema from 'validate'
import { ensureDirectory, checkDirectory } from '@universal-packages/fs-utils'

const directoryCheck = (value: any): boolean => {
  try {
    checkDirectory(value)
    return true
  } catch {
    return false
  }
}

const directoryCheckOptional = (value: any): boolean => {
  if (!value) return true
  try {
    checkDirectory(value)
    return true
  } catch {
    return false
  }
}

const directoryEnsure = (value: any): boolean => {
  try {
    ensureDirectory(value)
    return true
  } catch {
    return false
  }
}

export const coreConfigSchema = new Schema(
  {
    appsDirectory: {
      type: String,
      use: { directoryCheck },
      message: 'Directory is not accesible'
    },
    configDirectory: {
      type: String,
      use: { directoryCheck },
      message: 'Directory is not accesible'
    },
    modulesDirectory: {
      type: String,
      use: { directoryCheckOptional },
      message: 'Directory is not accesible'
    },
    tasksDirectory: {
      type: String,
      use: { directoryCheck },
      message: 'Directory is not accesible'
    },
    logger: {
      transportsDirectory: {
        type: String,
        use: { directoryCheckOptional },
        message: 'Directory is not accesible'
      },
      level: {
        type: String,
        enum: ['FATAL', 'ERROR', 'WARNING', 'QUERY', 'INFO', 'DEBUG', 'TRACE'],
        message: 'Must be one of: FATAL | ERROR | WARNING | QUERY | INFO | DEBUG | TRACE'
      },
      logsDirectory: {
        type: String,
        use: { directoryEnsure },
        message: 'Directory is not accesible'
      },
      silence: {
        type: Boolean
      }
    }
  },
  { strict: true }
)
