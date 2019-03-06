const _ = require('lodash');
const path = require('path');
const appRoot = require('app-root-path');
const async = require('async');
const prompt = require('prompt');
const { argv } = require('yargs');
const chalk = require('chalk');
const os = require('os');

const parseOptions = (options, promptOptions, done) => {
  // options.gitAccount = `${shellQuote([options.gitUser])}:${shellQuote([options.gitPassword])}`;
  const templateDef = _.find(
    options.availableTemplates, {
      name: promptOptions.templateSelect
    }
  );

  if (templateDef) {
    options.selectedTemplates.push(templateDef);
  }
  done(null, { ...options, ...promptOptions });
};

const promptUser = (options, done) => {
  const fmtDesc = (text) => `${chalk.whiteBright(text)} `;
  const { defaults, skipPrompt } = options;

  const properties = {
    projectDir: {
      description: fmtDesc('Enter main project directory'),
      required: true,
      default: defaults.projectDir
    },
    coreDir: {
      description: fmtDesc('Enter directory to contain the template submodules'),
      required: true,
      default: defaults.coreDir
    },
    templateSelect: {
      message: fmtDesc('What templates should be applied to core-js?'),
      required: true,
      validator: /none|core-api|core-client|core-termui/,
      warning: 'You must pick one of the following: \n  none \n  core-api \n  core-client \n  core-termui\n',
      default: defaults.templateSelect
    },
    isGitRepo: {
      description: fmtDesc('Is this an existing git repo?'),
      required: true,
      type: 'boolean',
      default: defaults.isGitRepo,
    },
    createRepo: {
      description: fmtDesc('Do you want to create a git repo?'),
      required: true,
      type: 'boolean',
      default: defaults.createRepo,
      ask: () => prompt.history('isGitRepo').value === true
    },
    repoName: {
      description: fmtDesc('Enter repository name'),
      required: true,
      default: defaults.repoName,
      ask: () => (
        prompt.history('isGitRepo').value === true
        && prompt.history('createRepo').value === true
      )
    },
    gitUser: {
      description: fmtDesc('Enter git username'),
      required: true,
      default: defaults.gitUser,
      ask: () => (
        prompt.history('isGitRepo').value === true
        && prompt.history('createRepo').value === true
      )
    },
    gitPassword: {
      description: fmtDesc('Enter git password'),
      required: true,
      default: defaults.gitPassword,
      ask: () => (
        prompt.history('isGitRepo').value === true
        && prompt.history('createRepo').value === true
      )
    }
  };

  if (skipPrompt) {
    done(null, options, defaults);
  } else {
    prompt.message = '>>';
    prompt.delimiter = chalk.cyan('> ');
    prompt.start();
    prompt.get({ properties }, (err, promptOpts) => (
      done(null, options, promptOpts)
    ));
  }
};

const initOptions = (done) => {
  const availableTemplates = {
    coreJs: {
      name: 'core-js',
      description: 'Core JS',
      repo:'https://njhoffman@github.com/njhoffman/core-js.git'
    },
    coreApi: {
      name: 'core-api',
      description: 'Core API',
      repo:'https://njhoffman@github.com/njhoffman/core-api.git'
    },
    coreClient: {
      name: 'core-client',
      description: 'Core Client',
      repo:'https://njhoffman@github.com/njhoffman/core-client.git'
    },
    coreTermUi: {
      name: 'core-termui',
      description: 'Core TermUI',
      repo:'https://njhoffman@github.com/njhoffman/core-termui.git'
    }
  };

  console.log(chalk.bold([
    '  Available templates:',
    '  --------------------'
  ].join('\n')));

  _.keys(availableTemplates).forEach(key => {
    const tpl = availableTemplates[key];
    console.log(`    ${tpl.name}\t${tpl.description}`);
  });
  console.log('');


  const options = {
    availableTemplates,
    selectedTemplates: [
      availableTemplates.coreJs
    ],
    homeDir: os.homedir(),
    skipPrompt: argv.force || argv.skip || false,
    verbosity: argv.v || argv.verbosity || 2,
    spawn: {
      stdio: argv.stdio || 'inherit',
    },
    defaults: {
      projectDir: argv.projectdir || argv.project || path.resolve(`${appRoot}/..`),
      coreDir: argv.coredir || argv.core || path.resolve(`${appRoot}`),
      templateSelect: argv.template || 'none',
      isGitRepo: argv.git || argv.gitrepo || false,
      createRepo: argv.creategit || false,
      repoName: argv.reponame || argv.repo || false,
      gitUser: argv.gituser || argv.user || false,
      gitPassword: argv.gitpassword || argv.password || argv.pass || false
    }
  };
  done(null, options);
};

const getOptions = (done) => async.waterfall([
  initOptions,
  promptUser,
  parseOptions
], done);

module.exports = { getOptions };
