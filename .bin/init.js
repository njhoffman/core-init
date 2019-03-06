/*
 * createApi
 *    1. base repository?
 *    2. github pages?
 *    3. create directory
 *    4. create repository
 * Initialize core submodule
 *   1. Select
 *     a. base-js
 *     b. api
 *     c. client
 *   2. Copy all base-js files over, then overwrite with api/client files
 *   3. init reports
 *   4. Run manifest: init
 *
 */
// getOptions,
// makeDirectory,
// initLocalRepo,
// initRemoteRepo,
// commitProject('build: initial commit'),
// tagHead('v1.0.0'),
// patchVersion,
// cloneSubmodule,
// commitProject('build: added core-api submodule'),
// patchVersion,
// installSubmodule,
// syncSubmodule,
// commitProject('build: first ejection from core-api submodule'),
// patchVersion,
// initWiki,
// initGithubPages

const async = require('async');
const chalk = require('chalk');
const { getOptions } = require('./options');
const { cloneSubmodules } = require('./git');

const runManifest = (options, done) => {
  console.log('OPTIONS', options);
  done(null, options);
};

const taskSequence = [
  getOptions,
  cloneSubmodules,
  // installDependencies,
  // initSubmodules,
  runManifest
];

console.log(chalk.bold('\n-- Init Core Submodules --\n'));

async.waterfall(taskSequence, (err, { homeDir }) => {
  console.log(`\nFinished initializing submodules at ${chalk.green(homeDir)}`);
});
