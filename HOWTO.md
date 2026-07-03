# How To

## Build

```sh
# prereq
npm run bump:patch
#
npm run build
```

## Integration tests

The integration suite packages Linux apps without network access during the
test itself. Before running it on a fresh machine, pre-fill Electron's cache:

```sh
npm run prepare:electron-cache:linux
```

This command downloads only the missing Linux Electron ZIPs required by
`src/integration-test.ts`:

```text
electron-v43.0.0-linux-x64.zip
electron-v43.0.0-linux-arm64.zip
electron-v11.2.3-linux-arm64.zip
```

By default, the files are stored under Electron's usual cache root:

```text
macOS: ~/Library/Caches/electron/nativefier-integration/
Linux: ~/.cache/electron/nativefier-integration/
```

To use a different root, set `ELECTRON_CACHE_ROOT`:

```sh
ELECTRON_CACHE_ROOT=/path/to/electron-cache npm run prepare:electron-cache:linux
```

Then run:

```sh
npm run test:integration
```

## Pack

```sh
node lib/cli.js --name "ChatGPT" --single-instance --maximize --icon icons/ChatGPT-Logo-1024x024.png  'https://chatgpt.com'
#
node lib/cli.js --name "TorrentQuest" --single-instance --icon icons/TorrentQuest-270x270.png 'https://torrentquest.com'
node lib/cli.js --name "TorrentQuest" 'https://torrentquest.com'
```

## Run

```sh
open ./ChatGPT-darwin-x64/ChatGPT.app
open ./TorrentQuest-darwin-x64/TorrentQuest.app
```

---

electron
@types/node

---
