const yargs = require('yargs');
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

server.run(argv.port);
