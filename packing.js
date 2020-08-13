const browserify = require('browserify');
const fs = require('fs');

browserify()
  .add('./index.js')
  .bundle()
  .pipe(fs.createWriteStream('./lib/bundle.js'));