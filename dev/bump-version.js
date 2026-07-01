#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const bump = process.argv[2];
const validBumps = new Set(['major', 'minor', 'patch']);

if (!validBumps.has(bump)) {
  console.error('Usage: node dev/bump-version.js <major|minor|patch>');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const packageJsonPath = path.join(root, 'package.json');
const shrinkwrapPath = path.join(root, 'npm-shrinkwrap.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function bumpVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`Unsupported version "${version}". Expected x.y.z.`);
  }

  const next = match.slice(1).map(Number);

  if (bump === 'major') {
    next[0] += 1;
    next[1] = 0;
    next[2] = 0;
  } else if (bump === 'minor') {
    next[1] += 1;
    next[2] = 0;
  } else {
    next[2] += 1;
  }

  return next.join('.');
}

const packageJson = readJson(packageJsonPath);
const previousVersion = packageJson.version;
const nextVersion = bumpVersion(previousVersion);

packageJson.version = nextVersion;
writeJson(packageJsonPath, packageJson);

if (fs.existsSync(shrinkwrapPath)) {
  const shrinkwrap = readJson(shrinkwrapPath);

  shrinkwrap.version = nextVersion;

  if (shrinkwrap.packages && shrinkwrap.packages['']) {
    shrinkwrap.packages[''].version = nextVersion;
  }

  writeJson(shrinkwrapPath, shrinkwrap);
}

console.log(`nativefier ${previousVersion} -> ${nextVersion}`);
