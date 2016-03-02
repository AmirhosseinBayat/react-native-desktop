/**
 * Copyright 2015-present Canonical Ltd.
 * 
 * Adapted from run-android.js
 * BSD-License
 */

'use strict';

const path = require('path');
const chalk = require('chalk');
const child_process = require('child_process');
const fs = require('fs');
const isPackagerRunning = require('../util/isPackagerRunning');
const Promise = require('promise');

function runUbuntu(argv, config) {
  return new Promise((resolve, reject) => {
    _runUbuntu(argv, comfig, resolve, reject);
  });
}

function _runUbuntu(argv, config, resolve, reject) {
  const args = parseCommandLine([{
    command: 'root',
    type: 'string',
    description: 'Override the root directory for the ubuntu build (which contains the ubuntu directory)',
  }], argv);
  args.root = args.root || '';

  if (!checkAndroid(args)) {
    console.log(chalk.red('Ubuntu project not found. Maybe run react-native ubuntu first?'));
    return;
  }

  resolve(isPackagerRunning().then(result => {
    if (result === 'running') {
      console.log(chalk.bold('JS server already running.'));
    } else if (result === 'unrecognized') {
      console.warn(chalk.yellow('JS server not recognized, continuing with build...'));
    } else {
      // result == 'not_running'
      console.log(chalk.bold('Starting JS server...'));
      startServerInNewWindow();
    }
    buildAndRun(args, reject);
  }));
}

function checkUbuntu(args) {
  return fs.existsSync(path.join(args.root, 'ubuntu/CMakeLists.txt')) && 
         process.platform.startsWith('linux');
}

function buildAndRun(args, reject) {
  process.chdir(path.join(args.root, 'ubuntu'));

  console.log(chalk.bold('Building the app...'));
  try {
      child_process.spawnSync('sh',
                              ['-c', "cmake . && make"],
                              {stdio: 'inherit'});
  } catch (e) {
      console.log(chalk.red('Could not build the app, see the error above.'));
      console.log(e.stdout)
      console.log(e.stderr)
      return;
  }
    
  console.log(chalk.bold('Starting the app...'));

  try {
      child_process.spawnSync('./run-app.sh', [],
                              {stdio: 'inherit'});
  } catch (e) {
    console.log(chalk.red('Could not start the app, see the error above.'));
    console.log(e.stdout)
    console.log(e.stderr)
    reject();
  }
}

module.exports = runUbuntu;
