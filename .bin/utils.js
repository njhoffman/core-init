const async = require('async');
const { spawn } = require('child_process');
const chalk = require('chalk');

const cmdOutput = (data) => {
  const output = `${data}`;
  if (output.trim().length > 0) {
    try {
      const jsonOut = JSON.parse(output);
      console.log('\n', jsonOut, '\n');
    } catch (e) {
      console.log('\n', output, '\n');
    }
  }
};

const spawnError = (cmd, args, err) => {
  console.log(`${chalk.red('\n\n** Error executing: ')} ${chalk.bold(cmd)} ${args.join(' ')}\n`);
  console.log(err);
  throw new Error(err);
};

const sectionOutput = (msg) => {
  console.log('\n---------------------------------------------');
  console.log(msg);
  console.log('---------------------------------------------\n');
};

const spawnCommand = ({ command, args, spawnOptions, verbosity }, done) => {
  if (verbosity > 0) {
    console.log(
      `\n  --${chalk.blueBright(command)} ${args.join(' ')}`,
      spawnOptions.cwd ? chalk.gray(`(${spawnOptions.cwd})`) : ''
    );
  }

  const spawned = spawn(command, args, spawnOptions);

  if (spawnOptions.stdio === 'pipe') {
    if (verbosity > 1) {
      spawned.stdout.on('data', cmdOutput);
    }
    spawned.stderr.on('data', err => spawnError(command, args, `${err}`));
    spawned.on('error', err => spawnError(command, args, err));
  }

  spawned.on('close', code => {
    // console.log(`  --${command} exited with ${code}`);
    done(null);
  });
};

const execCommands = ({ commands, dir, options }, allDone) => {
  const { spawn: spawnOptions, verbosity } = options;
  if (dir) {
    spawnOptions.cwd = dir;
  }

  async.eachSeries(
    commands,
    ([command, args], done) => {
      if (typeof command === 'function') {
        command(args, done);
      } else {
        spawnCommand({ command, args, spawnOptions, verbosity }, done);
      }
    },
    allDone
  );
};

const makeDirectory = (options, done) => {
  const { projectDir } = options;
  const commands = [
    ['mkdir', ['-p', `${projectDir}`]],
  ];

  sectionOutput(`Making directory: ${chalk.cyan(projectDir)}`);
  execCommands(
    { commands, options },
    err => done(err, options)
  );
};


module.exports = {
  cmdOutput,
  spawnError,
  sectionOutput,
  execCommands,
  makeDirectory
};
