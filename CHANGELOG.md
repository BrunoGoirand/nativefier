
2026-07-04
==========

**Updates**

| Module | Scope | Before | Now | Change type |
|---|---|---:|---:|---|
| `electron` | root/app dev | `^25.7.0` | `^43.0.0` | Very large upgrade, +18 majors |
| `@types/node` | root dev | `^20.5.6` | `^26.1.0` | +6 majors |
| `eslint` | root dev | `^8.46.0` | `^10.6.0` | +2 majors |
| `@typescript-eslint/eslint-plugin` | root dev | `^6.4.1` | `^8.62.1` | +2 majors |
| `@typescript-eslint/parser` | root dev | `^6.4.1` | `^8.62.1` | +2 majors |
| `webpack-cli` | root dev | `^5.1.4` | `^7.1.0` | +2 majors |
| `typescript` | root dev | `^5.1.6` | `^6.0.3` | +1 major |
| `jest` | root dev | `^29.6.2` | `^30.4.2` | +1 major |
| `@types/jest` | root dev | `^29.5.4` | `^30.0.0` | +1 major |
| `@electron/asar` | root prod | `^3.2.4` | `^4.2.0` | +1 major |
| `yargs` | root prod | `^17.7.2` | `^18.0.0` | +1 major |
| `rimraf` | root dev | `^5.0.1` | `^6.1.3` | +1 major |
| `electron-context-menu` | app prod | `^3.6.1` | `^4.1.2` | +1 major |
| `electron-dl` | app prod | `^3.5.0` | `^4.0.0` | +1 major |
| `playwright` | root dev | `^1.36.2` | `^1.61.1` | Large minor update |
| `webpack` | root dev | `^5.88.2` | `^5.108.3` | Minor update |
| `prettier` | root dev | `^3.0.1` | `^3.9.4` | Minor update |
| `fs-extra` | root prod | `^11.1.1` | `^11.3.6` | Minor update |
| `axios` | root prod | `^1.4.0` | `^1.18.1` | Minor update |
| `tmp` | root prod | `^0.2.1` | `^0.2.7` | Patch/minor update |
| `sanitize-filename` | root prod | `^1.6.3` | `^1.6.4` | Patch |
| `loglevel` | root/app prod | `^1.8.1` | `^1.8.1` declared, `1.9.2` installed | Lockfile/install updated |
| `electron-squirrel-startup` | app prod | `^1.0.0` | `^1.0.0`, `1.0.1` installed | Patch installed |

**Additions**

| Module | Scope | Current version | Likely role |
|---|---|---:|---|
| `cheerio` | root prod | `^1.0.0-rc.12` | HTML parsing |
| `file-type` | root prod | `^16.5.4` | File type detection, still needs updating |
| `which` | root prod | `^4.0.0` | Likely replacement for `hasbin` |
| `@eslint/js` | root dev | `^10.0.1` | New modern ESLint flat/config stack |
| `@types/which` | root dev | `^3.0.4` | Types for `which` |

**Removals / Replacements**

| Removed module | Before | Apparent replacement |
|---|---:|---|
| `gitcloud` | `^0.2.4` | Removed |
| `hasbin` | `^1.2.3` | Replaced by `which` |
| `ncp` | `^2.0.0` | Replaced by Node script `dev/copy-app-static.js` |
| `page-icon` | `^0.4.0` | Removed |
| `source-map-support` | root/app `^0.5.21` | Removed |
| `@types/hasbin` | `^1.2.0` | Removed |
| `@types/ncp` | `^2.0.5` | Removed |
| `@types/page-icon` | `^0.3.4` | Removed |

2026-07-01
==========

Status of module when solution was forked

**Priority 1**
| Module | Scope | Current version | Latest | Age | Behind |
|---|---:|---:|---:|---:|---:|
| `electron` | root/app | `25.7.0` to `25.9.8` | `43.0.0` | ~2 years 10 months | +18 majors |
| `@types/node` | root dev | `20.x` | `26.1.0` | ~2 years 10 months | +6 majors |

**Priority 2**
| Module | Current version | Latest | Age | Behind |
|---|---:|---:|---:|---:|
| `eslint` | `8.57.1` | `10.6.0` | ~2 years 11 months | +2 majors |
| `@typescript-eslint/*` | `6.21.0` | `8.62.1` | ~2 years 10 months | +2 majors |
| `webpack-cli` | `5.1.4` | `7.1.0` | ~3 years | +2 majors |
| `typescript` | `5.9.3` installed / `5.1.6` declared | `6.0.3` | ~2 years 10 months based on lockfile | +1 major |

**Priority 3**
| Module | Current version | Latest | Age | Behind |
|---|---:|---:|---:|---:|
| `jest` | `29.7.0` | `30.4.2` | ~2 years 10 months | +1 major |
| `@types/jest` | `29.5.14` | `30.0.0` | ~2 years 10 months | +1 major |
| `playwright` | `1.36/1.37` | `1.61.1` | ~2 years 10 months | same major, significantly behind |

**Priority 4**
| Module | Current version | Latest | Age | Behind |
|---|---:|---:|---:|---:|
| `@electron/asar` | `3.4.1` installed / `3.2.4` lockfile | `4.2.0` | ~1 to 3 years depending on source | +1 major |
| `electron-context-menu` | `3.6.1` | `4.1.2` | ~3 years 7 months | +1 major |
| `electron-dl` | `3.5.x` | `4.0.0` | ~3 years 7 months | +1 major |
| `yargs` | `17.7.3` | `18.0.0` | ~3 years | +1 major |
| `rimraf` | `5.0.10` | `6.1.3` | ~3 years | +1 major |

**Priority 5**
Very old packages, possibly no longer used: `ncp` latest release in 2015, `hasbin` latest release in 2016, `electron-window-state` latest release in 2018, `page-icon` latest release in 2021, `source-map-support` latest release in 2021, `gitcloud` latest release in 2022.

---
