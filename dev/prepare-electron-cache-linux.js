#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const constantsPath = path.join(root, 'src', 'constants.ts');
const constantsSource = fs.readFileSync(constantsPath, 'utf8');
const defaultElectronVersionMatch = constantsSource.match(
  /DEFAULT_ELECTRON_VERSION = '([^']+)'/,
);

if (!defaultElectronVersionMatch) {
  throw new Error(`Could not read DEFAULT_ELECTRON_VERSION from ${constantsPath}`);
}

const defaultElectronVersion = defaultElectronVersionMatch[1];
const cacheRoot =
  process.env.ELECTRON_CACHE_ROOT ||
  (process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Caches', 'electron')
    : path.join(
        process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'),
        'electron',
      ));
const cacheDir = path.join(cacheRoot, 'nativefier-integration');
const requiredZips = [
  {
    version: defaultElectronVersion,
    platform: 'linux',
    arch: 'x64',
  },
  {
    version: defaultElectronVersion,
    platform: 'linux',
    arch: 'arm64',
  },
  {
    version: '11.2.3',
    platform: 'linux',
    arch: 'arm64',
  },
];

function zipName({ version, platform, arch }) {
  return `electron-v${version}-${platform}-${arch}.zip`;
}

function findCachedElectronZip(name) {
  const dirsToSearch = [cacheRoot];

  while (dirsToSearch.length > 0) {
    const dir = dirsToSearch.pop();
    let entries;

    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === name) {
        return entryPath;
      }
      if (entry.isDirectory()) {
        dirsToSearch.push(entryPath);
      }
    }
  }

  return undefined;
}

function download(url, destination, redirects = 0) {
  if (redirects > 5) {
    return Promise.reject(new Error(`Too many redirects for ${url}`));
  }

  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      const { statusCode, headers } = response;

      if (
        statusCode &&
        statusCode >= 300 &&
        statusCode < 400 &&
        headers.location
      ) {
        response.resume();
        download(headers.location, destination, redirects + 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (statusCode !== 200) {
        response.resume();
        reject(new Error(`Download failed for ${url}: HTTP ${statusCode}`));
        return;
      }

      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
      file.on('error', reject);
    });

    request.on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(cacheDir, { recursive: true });

  for (const zip of requiredZips) {
    const name = zipName(zip);
    const cachedZipPath = findCachedElectronZip(name);

    if (cachedZipPath) {
      console.log(`Already cached: ${name}`);
      console.log(`  ${cachedZipPath}`);
      continue;
    }

    const destination = path.join(cacheDir, name);
    const tempDestination = `${destination}.tmp`;
    const url = `https://github.com/electron/electron/releases/download/v${zip.version}/${name}`;

    console.log(`Downloading: ${name}`);
    console.log(`  ${url}`);
    await download(url, tempDestination);
    fs.renameSync(tempDestination, destination);
    console.log(`Cached: ${destination}`);
  }

  console.log(`Electron cache root: ${cacheRoot}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
