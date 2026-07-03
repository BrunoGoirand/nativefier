import { BrowserWindow, clipboard, ContextMenuParams } from 'electron';
import type { Event as ElectronEvent, MenuItem } from 'electron';
import contextMenu, { Actions, Options } from 'electron-context-menu';

jest.mock('electron-context-menu', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../helpers/helpers');
jest.mock('../../../shared/src/options/model', () => ({
  outputOptionsToWindowOptions: jest.fn(() => ({})),
}));

import { nativeTabsSupported } from '../helpers/helpers';
import type { OutputOptions } from '../../../shared/src/options/model';
import { initContextMenu } from './contextMenu';

describe('initContextMenu', () => {
  const mockContextMenu = contextMenu as jest.MockedFunction<
    typeof contextMenu
  >;
  const mockNativeTabsSupported = nativeTabsSupported as jest.Mock;
  const mockClipboardWriteText = jest.spyOn(clipboard, 'writeText');

  beforeEach(() => {
    mockContextMenu.mockReset();
    mockNativeTabsSupported.mockReturnValue(false);
    mockClipboardWriteText.mockReset();
  });

  test('adds Copy Link Address for links', () => {
    initContextMenu({} as OutputOptions, new BrowserWindow());

    expect(mockContextMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        showCopyLink: false,
      }),
    );

    const [contextMenuOptions] = mockContextMenu.mock.calls[0] as [Options];
    const prepend = contextMenuOptions.prepend;
    if (!prepend) {
      throw new Error('Expected context menu prepend hook');
    }

    const items = prepend(
      {} as Actions,
      {
        linkURL: 'https://example.com/path',
      } as ContextMenuParams,
      new BrowserWindow(),
      {} as ElectronEvent,
    );

    const copyLinkAddress = items.find(
      (item) => item.label === 'Copy Link Address',
    );

    expect(copyLinkAddress).toBeDefined();
    copyLinkAddress?.click?.({} as MenuItem, new BrowserWindow(), {});

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      'https://example.com/path',
    );
  });
});
