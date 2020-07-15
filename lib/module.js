const { accessSync, constants, existsSync } = require('fs')
const { join, resolve } = require('path')
const { parse } = require('dotenv-flow')
const logger = require('./logger')

const nodeEnv = process.env.NODE_ENV || 'development'

function listDotenvFiles (dirname, filename) {
  return [
    resolve(dirname, filename + '.defaults'),
    resolve(dirname, filename),
    (nodeEnv !== 'test') && resolve(dirname, filename + '.local'),
    nodeEnv && resolve(dirname, filename + `.${nodeEnv}`),
    nodeEnv && resolve(dirname, filename + `.${nodeEnv}.local`)
  ].filter(filename => Boolean(filename))
}

module.exports = function (moduleOptions) {
  const options = {
    only: null,
    path: this.options.srcDir,
    filename: '.env',
    systemvars: false,
    ...this.options.dotenv,
    ...moduleOptions
  }

  const envFilePath = join(options.path, options.filename)

  try {
    accessSync(envFilePath, constants.R_OK)
  } catch (err) {
    logger.warn(`No \`${options.filename}\` file found in \`${options.path}\`.`)
    return
  }

  const files = listDotenvFiles(options.path, options.filename)
  const envConfig = parse(files.filter(existsSync))

  if (options.systemvars) {
    Object.keys(process.env).map((key) => {
      if (!(key in envConfig)) {
        envConfig[key] = process.env[key]
      }
    })
  }

  Object.keys(envConfig).forEach((key) => {
    if (!Array.isArray(options.only) || options.only.includes(key)) {
      this.options.env[key] = this.options.env[key] || envConfig[key]
    }
  })
}

module.exports.meta = require('../package.json')
