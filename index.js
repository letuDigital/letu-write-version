/**
 * Create `ui-version` and `buildHash`
 */

const git = require('git-rev-sync');
const fs = require('fs');
const packageFile = require('./package.json');
const dotenv = require('dotenv');

dotenv.config({ silent: true });

/**
 *
 * @type {Array}
 */
let configFromArgs = []
const args = process.argv.slice(2);

args.forEach(function(arg, i) {
  const configParts = arg.split('=');
  const param = configParts[0].replace('--', '').replace('-', '');

  configFromArgs[param] = configParts[1];
});

/**
 * Check if some path is set
 */
if (!configFromArgs.writeTo && !process.env.COMPILED_PATH) {
  process.exitCode = 1;
  throw new Error('Please provide path to write version files via --writeTo or COMPILED_PATH (.env file)');
}

/**
 * Get current date in 'DD.MM.YYY HH:MM' format
 *
 * @return {string}
 */
const getBuildDate = () => {
  const currentDate = new Date();
  const day = ('0' + currentDate.getDate()).slice(-2);
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
  const hours = ('0' + currentDate.getHours()).slice(-2);
  const minutes = ('0' + currentDate.getMinutes()).slice(-2);

  return `${day}.${month}.${currentDate.getFullYear()} ${hours}:${minutes}`;
};

/**
 * Get app version from package.json and add git hash to the end.
 *
 * @return {string}
 */
const getVersion = () => {
  return `${packageFile.version}.${git.short()}`;
};

/**
 * Prepare content from data object to put into file without extra spaces
 *
 * @param {object} contentObject
 * @return {string}
 */
const fileContent = (contentObject) => {
  const contentArray = [];
  Object.keys(contentObject).forEach((item) => {
    contentArray.push(`${item}: ${contentObject[item]}`);
  });

  return contentArray.join('\n');
};

/**
 * Data to write in ui-version file
 */
const contentObject = {
  Version: getVersion(),
  Date: getBuildDate(),
  Branch: git.branch(),
  Commit: git.long()
};

const compiledDir = process.env.COMPILED_PATH || configFromArgs.writeTo;
const distPath = process.env.DIST_PATH || '/dist';

fs.writeFileSync(`${compiledDir}${distPath}/ui-version`, fileContent(contentObject), { flag: 'w' });
fs.writeFileSync(`${compiledDir}${distPath}/buildHash`, getVersion(), { flag: 'w' });
