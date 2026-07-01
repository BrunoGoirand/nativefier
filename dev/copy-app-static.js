const { cpSync } = require('node:fs');

cpSync('app/src/static', 'app/lib/static', { recursive: true });
cpSync('app/dist/preload.js', 'app/lib/preload.js');
cpSync('app/dist/preload.js.map', 'app/lib/preload.js.map');
