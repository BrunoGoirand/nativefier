import {
  BrowserWindow,
  clipboard,
  ContextMenuParams,
  MenuItemConstructorOptions,
} from 'electron';
import contextMenu, { Actions } from 'electron-context-menu';

import { nativeTabsSupported, openExternal } from '../helpers/helpers';
import * as log from '../helpers/loggingHelper';
import { setupNativefierWindow } from '../helpers/windowEvents';
import { createNewWindow } from '../helpers/windowHelpers';
import {
  OutputOptions,
  outputOptionsToWindowOptions,
} from '../../../shared/src/options/model';

export function initContextMenu(
  options: OutputOptions,
  window?: BrowserWindow,
): void {
  log.debug('initContextMenu');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  contextMenu({
    prepend: (actions: Actions, params: ContextMenuParams) => {
      log.debug('contextMenu.prepend', { actions, params });
      const items: MenuItemConstructorOptions[] = [];
      if (params.linkURL && window) {
        items.push({
          label: 'Open Link in Default Browser',
          click: () => {
            openExternal(params.linkURL).catch((err) =>
              log.error('contextMenu Open Link in Default Browser ERROR', err),
            );
          },
        });
        items.push({
          label: 'Open Link in New Window',
          click: () =>
            createNewWindow(
              outputOptionsToWindowOptions(options, nativeTabsSupported()),
              setupNativefierWindow,
              params.linkURL,
              window,
            ),
        });
        items.push({
          label: 'Copy Link Address',
          click: () => clipboard.writeText(params.linkURL),
        });
        if (nativeTabsSupported()) {
          items.push({
            label: 'Open Link in New Tab',
            click: () =>
              // // Fire a new window event for a foreground tab
              // // Previously we called createNewTab directly, but it had incosistent and buggy behavior
              // // as it was mostly designed for running off of events. So this will create a new event
              // // for a foreground-tab for the event handler to grab and take care of instead.
              // (window as BrowserWindow).webContents.emit(
              //   // event name
              //   'new-window',
              //   // event object
              //   {
              //     // Leave to the default for a NewWindowWebContentsEvent
              //     newGuest: undefined,
              //     ...new Event('new-window'),
              //   }, // as NewWindowWebContentsEvent,
              //   // url
              //   params.linkURL,
              //   // frameName
              //   window?.webContents.mainFrame.name ?? '',
              //   // disposition
              //   'foreground-tab',
              // ),
              window.emit('new-window-for-tab', {
                ...new Event('new-window-for-tab'),
                url: params.linkURL,
              }),
          });
        }
      }
      return items;
    },
    showCopyImage: true,
    showCopyImageAddress: true,
    showCopyLink: false,
    showSaveImage: true,
  });
}
