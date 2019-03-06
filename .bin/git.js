const async = require('async');
const path = require('path');
const chalk = require('chalk');
const request = require('request');

const { sectionOutput, execCommands } = require('./utils');

const createRemoteRepo = ({ auth, repoName }, done) => {
  const url = 'https://api.github.com/user/repos';
  console.log(`\n  --REQUEST: ${chalk.blueBright(url)}`);
  request
    .post({
      auth,
      url,
      json: { name: repoName },
      headers: { 'User-Agent': auth.user },
    }, (err, response, body) => {
      if (err) {
        throw new Error(err);
      } else if (body.errors) {
        const { message /* , code, field, resource */ } = body.errors[0];
        console.log(`${chalk.red('\nError Creating Remote Git Repo:')} ${chalk.white(message)}\n`);
        throw new Error(message);
      }
      const { full_name: fullName, html_url: htmlUrl } = body;
      console.log(`  --${chalk.cyan(fullName)} created at ${chalk.bold(htmlUrl)}`);
      done(null);
    });
};

const initRemoteRepo = (options, done) => {
  const { projectDir, gitUser, gitPassword, repoName } = options;
  const gitRepo = `${gitUser}/${repoName}`;
  // TODO: handle repo already exist errors
  const commands = [
    [createRemoteRepo, {
      repoName,
      auth: {
        user: gitUser,
        pass: gitPassword
      }
    }],
    ['git', [
      'remote',
      'add',
      'origin',
      `https://${gitUser}:${gitPassword}@github.com/${gitRepo}.git`
    ]]
  ];

  sectionOutput(`Creating remote repository: ${chalk.cyan(repoName)}`);
  execCommands(
    { commands, options, dir: projectDir },
    err => done(err, options)
  );
};

const cloneSubmodule = ({ name, repo }, options, done) => {
  console.log(name, repo, options);

  const { coreDir } = options;
  const commands = [
    ['git', [
      'submodule',
      'add',
      repo,
      name
    ]]
  ];

  sectionOutput(`Cloning submodule: ${chalk.cyan(name)} from ${chalk.bold(repo)}`);
  execCommands(
    { commands, options, dir: coreDir },
    err => done(err, options)
  );
};

const patchVersion = (options, done) => {
  const { projectDir } = options;
  const packagePath = path.join(projectDir, 'package.json');
  /* eslint-disable import/no-dynamic-require, global-require */
  delete require.cache[packagePath];
  const { version } = require(packagePath);
  /* eslint-enable import/no-dynamic-require, global-require */
  const commands = [
    ['npm', ['version', 'patch']],
  ];

  sectionOutput(`Patching up from ${chalk.cyan(version)} in ${chalk.bold(projectDir)}`);
  execCommands(
    { commands, options, dir: projectDir },
    err => done(err, options)
  );
};

const commitProject = (message) => (options, done) => {
  const { projectDir } = options;

  const commands = [
    ['git', ['add', '-A']],
    ['git', ['commit', '-m', message]],
    ['git', ['push', 'origin', 'master']]
  ];

  console.log(`\n  --committing and pushing: ${projectDir}`);
  return execCommands(
    { commands, options, dir: projectDir },
    err => done(err, options)
  );
};

const tagHead = (tag) => (options, done) => {
  const { projectDir } = options;

  const commands = [
    ['git', ['add', '-A']],
    ['git', ['tag', tag]],
    // ['git', ['push', 'origin', 'master']]
  ];

  console.log(`\n  --pushing tag ${tag} to remote: ${projectDir}`);
  return execCommands(
    { commands, options, dir: projectDir },
    err => done(err, options)
  );
};

module.exports = {
  initRemoteRepo,
  cloneSubmodules: (options, allDone) => (
    async.each(options.selectedTemplates, (tpl, done) => (
      cloneSubmodule(tpl, options, done)
    ))
  ),
  commitProject,
  patchVersion,
  tagHead
};
