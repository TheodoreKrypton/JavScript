#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { execSync, exec } = require('child_process');
const Axios = require('axios');
const os = require('os');
const server = require('../src/server');

const { argv } = yargs
  .option('port', {
    alias: 'p',
    description: 'listen to port',
    default: 8081,
    type: 'int',
  })
  .help()
  .alias('help', 'h');

const openBrowser = () => {
  const url = `http://localhost:${argv.port}`;
  const platform = os.platform();
  if (platform.includes('win32')) {
    exec(`start "" "${url}"`);
  } else if (platform.includes('linux')) {
    exec(`xdg-open ${url}`);
  } else {
    exec(`open ${url}`);
  }
};

(() => {
  const projectRoot = path.join(__dirname, '../');
  if (fs.existsSync(path.join(projectRoot, 'frontend/build/index.html'))) {
    server.run(argv.port, openBrowser);
  } else {
    const url = 'https://github.com/TheodoreKrypton/JavPy-webfe/archive/websocket.zip';
    console.log(`fronend not found, downloading from ${url}`);
    Axios({
      method: 'GET',
      url,
      responseType: 'stream',
    }).then((res) => {
      res.data.pipe(unzipper.Extract({ path: projectRoot })).on('close', () => {
        console.log('building frontend...');
        fs.renameSync(path.join(projectRoot, 'JavPy-webfe-websocket'), path.join(projectRoot, 'frontend'));
        execSync('cd frontend && npm install --only=prod && npm run build', { stdio: 'inherit' });
        console.log('cleaning...');
        fs.readdirSync(path.join(projectRoot, 'frontend')).forEach((file) => {
          if (file !== 'build') {
            fs.rmdir(path.join(projectRoot, `frontend/${file}`));
          }
        });
        server.run(argv.port, openBrowser);
      });
    });
  }
})();
