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

**Mises à jour**

| Module | Scope | Avant | Maintenant | Type de changement |
|---|---|---:|---:|---|
| `electron` | root/app dev | `^25.7.0` | `^43.0.0` | Très grosse montée, +18 majeures |
| `@types/node` | root dev | `^20.5.6` | `^26.1.0` | +6 majeures |
| `eslint` | root dev | `^8.46.0` | `^10.6.0` | +2 majeures |
| `@typescript-eslint/eslint-plugin` | root dev | `^6.4.1` | `^8.62.1` | +2 majeures |
| `@typescript-eslint/parser` | root dev | `^6.4.1` | `^8.62.1` | +2 majeures |
| `webpack-cli` | root dev | `^5.1.4` | `^7.1.0` | +2 majeures |
| `typescript` | root dev | `^5.1.6` | `^6.0.3` | +1 majeure |
| `jest` | root dev | `^29.6.2` | `^30.4.2` | +1 majeure |
| `@types/jest` | root dev | `^29.5.4` | `^30.0.0` | +1 majeure |
| `@electron/asar` | root prod | `^3.2.4` | `^4.2.0` | +1 majeure |
| `yargs` | root prod | `^17.7.2` | `^18.0.0` | +1 majeure |
| `rimraf` | root dev | `^5.0.1` | `^6.1.3` | +1 majeure |
| `electron-context-menu` | app prod | `^3.6.1` | `^4.1.2` | +1 majeure |
| `electron-dl` | app prod | `^3.5.0` | `^4.0.0` | +1 majeure |
| `playwright` | root dev | `^1.36.2` | `^1.61.1` | Grosse mise à jour mineure |
| `webpack` | root dev | `^5.88.2` | `^5.108.3` | Mise à jour mineure |
| `prettier` | root dev | `^3.0.1` | `^3.9.4` | Mise à jour mineure |
| `fs-extra` | root prod | `^11.1.1` | `^11.3.6` | Mise à jour mineure |
| `axios` | root prod | `^1.4.0` | `^1.18.1` | Mise à jour mineure |
| `tmp` | root prod | `^0.2.1` | `^0.2.7` | Mise à jour patch/minor |
| `sanitize-filename` | root prod | `^1.6.3` | `^1.6.4` | Patch |
| `loglevel` | root/app prod | `^1.8.1` | `^1.8.1` déclaré, installé `1.9.2` | Lock/install mis à jour |
| `electron-squirrel-startup` | app prod | `^1.0.0` | `^1.0.0`, installé `1.0.1` | Patch installé |

**Ajouts**
| Module | Scope | Version actuelle | Rôle probable |
|---|---|---:|---|
| `cheerio` | root prod | `^1.0.0-rc.12` | Parsing HTML |
| `file-type` | root prod | `^16.5.4` | Détection type fichier, reste à mettre à jour |
| `which` | root prod | `^4.0.0` | Remplacement probable de `hasbin` |
| `@eslint/js` | root dev | `^10.0.1` | Nouvelle stack ESLint flat/config moderne |
| `@types/which` | root dev | `^3.0.4` | Types pour `which` |

**Suppressions / Remplacements**
| Module supprimé | Avant | Remplacement apparent |
|---|---:|---|
| `gitcloud` | `^0.2.4` | Supprimé |
| `hasbin` | `^1.2.3` | Remplacé par `which` |
| `ncp` | `^2.0.0` | Remplacé par script Node `dev/copy-app-static.js` |
| `page-icon` | `^0.4.0` | Supprimé |
| `source-map-support` | root/app `^0.5.21` | Supprimé |
| `@types/hasbin` | `^1.2.0` | Supprimé |
| `@types/ncp` | `^2.0.5` | Supprimé |
| `@types/page-icon` | `^0.3.4` | Supprimé |

---

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
