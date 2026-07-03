import { AppOptions } from '../../shared/src/options/model';
import {
  applyMacOSSingleInstancePreference,
  normalizeAppName,
} from './prepareElectronApp';

function buildOptions(
  platform: string,
  singleInstance: boolean,
  extendInfo?: Record<string, unknown>,
): AppOptions {
  return {
    packager: {
      arch: 'x64',
      dir: '',
      extendInfo,
      platform,
      portable: false,
      targetUrl: 'https://example.com',
      upgrade: false,
    },
    nativefier: {
      singleInstance,
    },
  } as AppOptions;
}

describe('normalizeAppName', () => {
  test('it is stable', () => {
    // Non-determinism / unstability would cause using a different appName
    // at each app regen, thus a different appData folder, which would cause
    // losing user state, including login state through cookies.
    const normalizedTrello = normalizeAppName('Trello', 'https://trello.com');
    expect(normalizedTrello).toBe('trello-nativefier-679e8e');
  });
});

describe('applyMacOSSingleInstancePreference', () => {
  test('it allows multiple instances by default on macOS', () => {
    const options = buildOptions('darwin', false);

    applyMacOSSingleInstancePreference(options);

    expect(options.packager.extendInfo).toEqual({
      LSMultipleInstancesProhibited: false,
    });
  });

  test('it prohibits multiple instances when singleInstance is enabled', () => {
    const options = buildOptions('darwin', true, {
      NSRequiresAquaSystemAppearance: false,
    });

    applyMacOSSingleInstancePreference(options);

    expect(options.packager.extendInfo).toEqual({
      NSRequiresAquaSystemAppearance: false,
      LSMultipleInstancesProhibited: true,
    });
  });

  test('it leaves non-macOS packager options unchanged', () => {
    const options = buildOptions('linux', false);

    applyMacOSSingleInstancePreference(options);

    expect(options.packager.extendInfo).toBeUndefined();
  });
});
