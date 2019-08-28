/**
 * Create `version.json` and `buildHash`
 */

const path = require('path')
const git = require('git-rev-sync')
const fs = require('fs')
const dotenv = require('dotenv')

dotenv.config({silent: true})

/**
 *
 * @type {Array}
 */
let configFromArgs = []

// Build path to package.json
const pathToPackageFile = path.format({
  dir: process.cwd(),
  base: 'package.json'
})

/**
 * Main function
 */
const start = () => {
  fs.access(pathToPackageFile, (err) => {
    // If package.json doesn't exist
    if (err) {
      process.exitCode = 1
      throw new Error('Please add package.json file to correct folder')
    } else {
      fs.readFile(pathToPackageFile, (err, data) => {
        if (err) {
          process.exitCode = 1
          throw new Error('Cannot read package.json file')
        }

        const packageFile = JSON.parse(data)

        writeFiles(`${packageFile.version}.${git.short()}`)
      })
    }
  })
}

/**
 * Get current date in 'DD.MM.YYY HH:MM' format
 *
 * @return {string}
 */
const getBuildDate = () => {
  const currentDate = new Date()
  const day = ('0' + currentDate.getDate()).slice(-2)
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2)
  const hours = ('0' + currentDate.getHours()).slice(-2)
  const minutes = ('0' + currentDate.getMinutes()).slice(-2)

  return `${day}.${month}.${currentDate.getFullYear()} ${hours}:${minutes}`
}

/**
 * Prepare content from data object to put into file witht pretty printing
 *
 * @param {object} contentObject
 * @return {string}
 */
const fileContent = (contentObject) => {
  return JSON.stringify(contentObject, null, 2);
}

/**
 * Write a files
 *
 * @param {string} version
 */
const writeFiles = (version) => {
  /**
   * Data to write in ui-version file
   */
  const contentObject = {
    version: version,
    buildDate: getBuildDate(),
    branch: git.branch(),
    commit: git.long()
  }

  const compiledDir = process.env.COMPILED_PATH || process.cwd()
  const distPath = process.env.DIST_PATH || '/dist'

  fs.writeFileSync(`${compiledDir}${distPath}/version.json`, fileContent(contentObject), {flag: 'w'})
  fs.writeFileSync(`${compiledDir}${distPath}/buildHash`, version, {flag: 'w'})
}

// Go, go, go!!
start()
