import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import axios, { AxiosHeaders, AxiosResponse } from 'axios';

import { DEFAULT_ELECTRON_VERSION } from './constants';
import { getTempDir } from './helpers/helpers';
import { getChromeVersionForElectronVersion } from './infer/browsers/inferChromeVersion';
import { getLatestFirefoxVersion } from './infer/browsers/inferFirefoxVersion';
import { getLatestSafariVersion } from './infer/browsers/inferSafariVersion';
import { inferArch } from './infer/inferOs';
import { buildNativefierApp } from './main';
import { userAgent } from './options/fields/userAgent';
import {
  GlobalShortcut,
  NativefierOptions,
  RawOptions,
} from '../shared/src/options/model';
import { parseJson } from './utils/parseUtils';

const INTEGRATION_APP_NAME = 'npm';
const INTEGRATION_ICON_PATHS = {
  darwin: path.join(
    __dirname,
    '..',
    'node_modules',
    'electron',
    'dist',
    'Electron.app',
    'Contents',
    'Resources',
    'electron.icns',
  ),
  linux: path.join(
    __dirname,
    '..',
    'node_modules',
    'playwright-core',
    'lib',
    'server',
    'chromium',
    'appIcon.png',
  ),
};
const INTEGRATION_TARGET_URL = 'https://nativefier.test/';

const axiosGetMock = jest.spyOn(axios, 'get');

async function checkApp(
  appRoot: string,
  inputOptions: RawOptions,
): Promise<void> {
  const arch = inputOptions.arch ? inputOptions.arch : inferArch();
  if (inputOptions.out !== undefined) {
    expect(
      path.join(
        inputOptions.out,
        `${INTEGRATION_APP_NAME}-${inputOptions.platform as string}-${arch}`,
      ),
    ).toBe(appRoot);
  }

  let relativeResourcesDir = 'resources';

  if (inputOptions.platform === 'darwin') {
    relativeResourcesDir = path.join(
      `${INTEGRATION_APP_NAME}.app`,
      'Contents',
      'Resources',
    );
  }

  const appPath = path.join(appRoot, relativeResourcesDir, 'app');

  const configPath = path.join(appPath, 'nativefier.json');
  const nativefierConfig: NativefierOptions | undefined =
    parseJson<NativefierOptions>(fs.readFileSync(configPath).toString());
  expect(nativefierConfig).not.toBeUndefined();

  expect(inputOptions.targetUrl).toBe(nativefierConfig?.targetUrl);

  // Test name inferring
  expect(nativefierConfig?.name).toBe(INTEGRATION_APP_NAME);

  // Test icon writing
  const iconFile =
    inputOptions.platform === 'darwin'
      ? path.join('..', 'electron.icns')
      : inputOptions.platform === 'linux'
        ? 'icon.png'
        : 'icon.ico';
  const iconPath = path.join(appPath, iconFile);
  expect(fs.existsSync(iconPath)).toEqual(true);
  expect(fs.statSync(iconPath).size).toBeGreaterThan(1000);

  // Test arch
  if (inputOptions.arch !== undefined) {
    expect(inputOptions.arch).toEqual(nativefierConfig?.arch);
  } else {
    expect(os.arch()).toEqual(nativefierConfig?.arch);
  }

  // Test electron version
  expect(nativefierConfig?.electronVersionUsed).toBe(
    inputOptions.electronVersion || DEFAULT_ELECTRON_VERSION,
  );

  // Test user agent
  if (inputOptions.userAgent) {
    const translatedUserAgent = await userAgent({
      packager: {
        platform: inputOptions.platform,
        electronVersion:
          inputOptions.electronVersion || DEFAULT_ELECTRON_VERSION,
      },
      nativefier: { userAgent: inputOptions.userAgent },
    });
    inputOptions.userAgent = translatedUserAgent || inputOptions.userAgent;
  }

  expect(nativefierConfig?.userAgent).toEqual(inputOptions.userAgent);

  // Test lang
  expect(nativefierConfig?.lang).toEqual(inputOptions.lang);

  // Test global shortcuts
  if (inputOptions.globalShortcuts) {
    let shortcutData: GlobalShortcut[] | undefined = [];

    if (typeof inputOptions.globalShortcuts === 'string') {
      shortcutData = parseJson<GlobalShortcut[]>(
        fs.readFileSync(inputOptions.globalShortcuts, 'utf8'),
      );
    } else {
      shortcutData = inputOptions.globalShortcuts;
    }

    expect(nativefierConfig?.globalShortcuts).toStrictEqual(shortcutData);
  }
}

describe('Nativefier', () => {
  jest.setTimeout(300000);

  test.each(['darwin', 'linux'])(
    'builds a Nativefier app for platform %s',
    async (platform) => {
      const tempDirectory = getTempDir('integtest');
      const options: RawOptions = {
        icon: getIntegrationIconPath(platform),
        lang: 'en-US',
        name: INTEGRATION_APP_NAME,
        out: tempDirectory,
        overwrite: true,
        platform,
        targetUrl: INTEGRATION_TARGET_URL,
      };
      prepareOfflineElectronZipDir(options);
      const appPath = await buildNativefierApp(options);
      expect(appPath).not.toBeUndefined();
      await checkApp(appPath, options);
    },
  );
});

function generateShortcutsFile(dir: string): string {
  const shortcuts = [
    {
      key: 'MediaPlayPause',
      inputEvents: [
        {
          type: 'keyDown',
          keyCode: 'Space',
        },
      ],
    },
    {
      key: 'MediaNextTrack',
      inputEvents: [
        {
          type: 'keyDown',
          keyCode: 'Right',
        },
      ],
    },
  ];

  const filename = path.join(dir, 'shortcuts.json');
  fs.writeFileSync(filename, JSON.stringify(shortcuts));

  return filename;
}

function getIntegrationIconPath(platform?: string): string {
  return platform === 'darwin'
    ? INTEGRATION_ICON_PATHS.darwin
    : INTEGRATION_ICON_PATHS.linux;
}

function prepareOfflineElectronZipDir(options: RawOptions): string {
  expectIntegrationBuildArtifacts();

  const platform = options.platform;
  if (!platform) {
    throw new Error('Integration test requires an explicit Electron platform.');
  }

  const arch = options.arch ?? inferArch();
  const electronVersion = options.electronVersion ?? DEFAULT_ELECTRON_VERSION;
  const zipName = `electron-v${electronVersion}-${platform}-${arch}.zip`;
  const cachedZipPath = findCachedElectronZip(zipName);

  if (!cachedZipPath) {
    throw new Error(
      [
        `Missing cached Electron ZIP for integration test: ${zipName}`,
        'This test runs with electronZipDir to avoid network downloads.',
        `Pre-cache ${zipName} under one of: ${getElectronCacheRoots().join(
          ', ',
        )}`,
      ].join('\n'),
    );
  }

  const electronZipDir = options.electronZipDir ?? getTempDir('electronZipDir');
  const testZipPath = path.join(electronZipDir, zipName);
  if (!fs.existsSync(testZipPath)) {
    fs.symlinkSync(cachedZipPath, testZipPath);
  }
  options.electronZipDir = electronZipDir;
  return electronZipDir;
}

function expectIntegrationBuildArtifacts(): void {
  const mainPath = path.join(__dirname, '..', 'app', 'lib', 'main.js');
  if (!fs.existsSync(mainPath)) {
    throw new Error(
      [
        `Missing built app entrypoint: ${mainPath}`,
        'Run `npm run build` before integration tests, or use `npm run test:integration`.',
      ].join('\n'),
    );
  }
}

function findCachedElectronZip(zipName: string): string | undefined {
  const dirsToSearch = [...getElectronCacheRoots()];

  while (dirsToSearch.length > 0) {
    const dir = dirsToSearch.pop() as string;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === zipName) {
        return entryPath;
      }
      if (entry.isDirectory()) {
        dirsToSearch.push(entryPath);
      }
    }
  }

  return undefined;
}

function getElectronCacheRoots(): string[] {
  const roots = [
    path.join(os.homedir(), 'Library', 'Caches', 'electron'),
    path.join(
      process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), '.cache'),
      'electron',
    ),
  ];

  if (process.env.LOCALAPPDATA) {
    roots.push(path.join(process.env.LOCALAPPDATA, 'electron', 'Cache'));
  }

  return roots;
}

describe('Nativefier upgrade', () => {
  jest.setTimeout(300000);

  test.each([
    { platform: 'darwin', arch: 'x64' },
    { platform: 'linux', arch: 'arm64', userAgent: 'FIREFOX 60' },
    // Exhaustive integration testing here would be neat, but takes too long.
    // -> For now, only testing a subset of platforms/archs
    // { platform: 'win32', arch: 'x64' },
    // { platform: 'darwin', arch: 'arm64' },
    // { platform: 'linux', arch: 'x64' },
    // { platform: 'linux', arch: 'armv7l' },
  ])(
    'can upgrade a Nativefier app for platform/arch: %s',
    async (baseAppOptions) => {
      const tempDirectory = getTempDir('integtestUpgrade1');
      const shortcuts = generateShortcutsFile(tempDirectory);
      const options: RawOptions = {
        electronVersion: '11.2.3',
        globalShortcuts: shortcuts,
        name: INTEGRATION_APP_NAME,
        out: tempDirectory,
        overwrite: true,
        targetUrl: INTEGRATION_TARGET_URL,
        ...baseAppOptions,
      };
      options.icon = getIntegrationIconPath(options.platform);
      prepareOfflineElectronZipDir(options);
      const appPath = await buildNativefierApp(options);
      expect(appPath).not.toBeUndefined();
      await checkApp(appPath, options);

      const upgradeOptions: RawOptions = {
        electronZipDir: prepareOfflineElectronZipDir({
          ...options,
          electronVersion: DEFAULT_ELECTRON_VERSION,
        }),
        upgrade: appPath,
        overwrite: true,
      };

      const upgradeAppPath = await buildNativefierApp(upgradeOptions);
      options.electronVersion = DEFAULT_ELECTRON_VERSION;
      options.userAgent = baseAppOptions.userAgent;
      expect(upgradeAppPath).not.toBeUndefined();
      await checkApp(upgradeAppPath, options);
    },
  );
});

describe('Browser version retrieval', () => {
  beforeEach(() => {
    axiosGetMock.mockReset();
  });

  test('get chrome version with electron version', async () => {
    axiosGetMock.mockResolvedValueOnce(
      buildAxiosResponse([
        {
          chrome: '89.0.4389.69',
          date: '2021-03-02',
          files: [],
          modules: '87',
          node: '14.16.0',
          openssl: '1.1.1',
          uv: '1.40.0',
          v8: '8.9.255.20',
          version: '12.0.0',
          zlib: '1.2.11',
        },
      ]),
    );

    await expect(getChromeVersionForElectronVersion('12.0.0')).resolves.toBe(
      '89.0.4389.69',
    );
  });

  test('get latest firefox version', async () => {
    axiosGetMock.mockResolvedValueOnce(
      buildAxiosResponse({ LATEST_FIREFOX_VERSION: '116.0.3' }),
    );
    const firefoxVersion = await getLatestFirefoxVersion();

    const majorVersion = parseInt(firefoxVersion.split('.')[0]);
    expect(majorVersion).toBeGreaterThanOrEqual(88);
  });

  test('get latest safari version', async () => {
    axiosGetMock.mockResolvedValueOnce(buildAxiosResponse(getSafariFixture()));
    const safariVersion = await getLatestSafariVersion();

    expect(safariVersion.majorVersion).toBeGreaterThanOrEqual(14);
  });
});

function buildAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    config: { headers: new AxiosHeaders() },
    data,
    headers: {},
    status: 200,
    statusText: 'OK',
  };
}

function getSafariFixture(): string {
  return `
    <h3><span class="mw-headline" id="Safari_16">Safari 16</span></h3>
    <h3><span class="mw-headline" id="Safari_17">Safari 17</span></h3>
    >Release history<
    >Release history<
    <table>
      <caption>Safari 17.x</caption>
      <tbody>
        <tr><td>17.1.2</td><td>616.1.2.3</td></tr>
      </tbody>
    </table>
  `;
}
