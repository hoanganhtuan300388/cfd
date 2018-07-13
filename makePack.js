// "use strict";

const fs = require('fs');
const tgtPkg = require('./dist/package.json');
const srcPkg = require('./package.json');
let mode = process.argv[2];

// prod -> real
mode = mode.replace('prod', 'real');

tgtPkg.name = `${srcPkg.name}_${mode}`;
tgtPkg.version = srcPkg.version;
tgtPkg.devMode = mode;

const content = JSON.stringify(tgtPkg);

fs.writeFile("./dist/package.json", content, 'utf8', function (err) {
  if (err) {
    return console.log(err);
  }
}); 