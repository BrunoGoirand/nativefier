# How To

## Build

```sh
# prereq
npm run bump:patch
#
npm run build
```

## Pack

```sh
node lib/cli.js --name "ChatGPT" --single-instance --maximize --icon ~/Downloads/ChatGPT-Logo-1024x024.png  'https://chatgpt.com'
#
node lib/cli.js --name "TorrentQuest" --single-instance 'https://torrentquest.com'
node lib/cli.js --name "TorrentQuest" 'https://torrentquest.com'
```

## Run

```sh
open ./ChatGPT-darwin-x64/ChatGPT.app
open ./TorrentQuest-darwin-x64/TorrentQuest.app
```

---

eslint
@typescript-eslint/*
webpack-cli
typescript

---
