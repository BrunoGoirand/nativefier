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
#
node lib/cli.js --name "TorrentQuest" --single-instance --disable-context-menu --icon icons/TorrentQuest-270x270.png 'https://torrentquest.com'
```

## Run

```sh
open ./ChatGPT-darwin-x64/ChatGPT.app
open ./TorrentQuest-darwin-x64/TorrentQuest.app
```

## Versionning

```sh
npm run bump:major|minor|patch
```

---

## Upgrades

Bilan refait au **4 juillet 2026** via `npm outdated` + dates de publication npm. Le retard versionnel restant est maintenant très limité : **3 dépendances seulement** sont encore derrière la dernière version.

**Retard À Prioriser**
| Priorité | Module | Scope | Actuelle | Latest | Retard majeur | Ancienneté version actuelle | Recommandation |
|---:|---|---|---:|---:|---:|---:|---|
| 1 | `file-type` | root prod | `16.5.4` | `22.0.1` | +6 | ~3 ans 11 mois | À traiter en premier : probable migration ESM/API. |
| 2 | `which` | root prod | `4.0.0` | `7.0.0` | +3 | ~2 ans 10 mois | À migrer ensuite, vérifier usages CLI/path. |
| 3 | `eslint-config-prettier` | root dev | `9.1.2` | `10.1.8` | +1 | ~11 mois | Faible risque, à faire avec lint/tests. |

**Ancienneté Notable Sans Retard Versionnel**
| Module | Scope | Version | Latest | Ancienneté | Commentaire |
|---|---|---:|---:|---:|---|
| `electron-window-state` | app prod | `5.0.3` | `5.0.3` | ~7 ans 7 mois | À jour, mais paquet très ancien : surveiller/remplacer si problème Electron 43. |
| `electron-packager` | root prod | `17.1.2` | `17.1.2` | ~2 ans 10 mois | À jour, mais projet mature/peu mouvant ; surveiller compatibilité Electron récente. |
| `@types/fs-extra` | root dev | `11.0.4` | `11.0.4` | ~2 ans 7 mois | À jour, risque faible. |
| `@types/tmp` | root dev | `0.2.6` | `0.2.6` | ~2 ans 7 mois | À jour, risque faible. |
| `electron-dl` | app prod | `4.0.0` | `4.0.0` | ~2 ans 2 mois | À jour, mais à tester avec Electron 43. |
| `electron-squirrel-startup` | app prod | `1.0.1` | `1.0.1` | ~2 ans 1 mois | À jour, plutôt stable. |
| `@types/which` | root dev | `3.0.4` | `3.0.4` | ~2 ans 1 mois | À jour, faible priorité. |

**Conclusion**
Le chantier critique Electron/TypeScript/ESLint/Jest semble déjà absorbé dans l’état actuel du projet. L’ordre que je proposerais maintenant :

1. `file-type`
2. `which`
3. `eslint-config-prettier`
4. tests de compatibilité autour des paquets Electron anciens mais à jour, surtout `electron-window-state`, `electron-packager`, `electron-dl`

---
