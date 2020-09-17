const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { execSync } = require('child_process');
const Axios = require('axios');
const server = require('./server');

const { argv } = yargs
  .option('port', {
    alias: 'p',
    description: 'listen to port',
    default: 8081,
    type: 'int',
  })
  .help()
  .alias('help', 'h');

(() => {
  if (fs.existsSync(path.join(__dirname, 'frontend/build/index.html'))) {
    server.run(argv.port);
  } else {
    const url = 'https://github.com/TheodoreKrypton/JavPy-webfe/archive/websocket.zip';
    console.log(`fronend not found, downloading from ${url}`);
    Axios({
      method: 'GET',
      url,
      responseType: 'stream',
    }).then((res) => {
      res.data.pipe(unzipper.Extract({ path: __dirname })).on('close', () => {
        console.log('building frontend...');
        fs.renameSync(path.join(__dirname, 'JavPy-webfe-websocket'), path.join(__dirname, 'frontend'));
        execSync('cd frontend && npm install --only=prod && npm run build', { stdio: 'inherit' });
        console.log('cleaning...');
        fs.readdirSync(path.join(__dirname, 'frontend')).forEach((file) => {
          if (file !== 'build') {
            fs.rmdir(path.join(__dirname, `frontend/${file}`));
          }
        });
        server.run(argv.port);
      });
    });
  }
})();
