import { JSONSchema7 } from 'json-schema'

export const coreConfigSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: false,
  properties: {
    apps: {
      type: 'object',
      additionalProperties: false,
      properties: {
        location: {
          type: 'string'
        },
        watcher: {
          type: 'object',
          additionalProperties: false,
          properties: {
            enabled: {
              type: 'boolean'
            },
            ignore: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    config: {
      type: 'object',
      additionalProperties: false,
      properties: {
        location: {
          type: 'string'
        }
      }
    },
    environments: {
      type: 'object',
      additionalProperties: false,
      properties: {
        location: {
          type: 'string'
        }
      }
    },
    modules: {
      type: 'object',
      additionalProperties: false,
      properties: {
        asGlobals: {
          type: 'boolean'
        },
        location: {
          type: 'string'
        }
      }
    },
    tasks: {
      type: 'object',
      additionalProperties: false,
      properties: {
        location: {
          type: 'string'
        }
      }
    },
    terminalPresenter: {
      type: 'object',
      additionalProperties: false,
      properties: {
        clear: {
          type: 'boolean'
        },
        decorateConsole: {
          type: 'boolean'
        },
        enable: {
          type: 'boolean'
        },
        framesPerSecond: {
          type: 'number'
        }
      }
    },
    logger: {
      type: 'object',
      additionalProperties: false,
      properties: {
        level: {
          oneOf: [
            {
              type: 'string',
              enum: ['FATAL', 'ERROR', 'WARNING', 'QUERY', 'INFO', 'DEBUG', 'TRACE']
            },
            {
              type: 'array',
              items: {
                type: 'string',
                enum: ['FATAL', 'ERROR', 'WARNING', 'QUERY', 'INFO', 'DEBUG', 'TRACE']
              }
            }
          ]
        },
        silence: {
          type: 'boolean'
        },
        transports: {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'string'
              },
              {
                type: 'object',
                additionalProperties: false,
                properties: {
                  transport: {
                    type: 'string'
                  },
                  transportOptions: {
                    type: 'object'
                  }
                },
                required: ['transport']
              }
            ]
          }
        },
        filterMetadataKeys: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  }
}
