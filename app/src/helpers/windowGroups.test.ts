import { BrowserWindow } from 'electron';

import {
  closeWindowGroup,
  markWindowGroup,
  resetWindowGroupsForTests,
} from './windowGroups';

describe('windowGroups', () => {
  afterEach(() => {
    resetWindowGroupsForTests();
  });

  test('closes all windows in the same group', () => {
    const firstWindow = new BrowserWindow();
    const secondWindow = new BrowserWindow();
    const otherWindow = new BrowserWindow();
    const closeFirstWindow = jest.spyOn(firstWindow, 'close');
    const closeSecondWindow = jest.spyOn(secondWindow, 'close');
    const closeOtherWindow = jest.spyOn(otherWindow, 'close');

    markWindowGroup(firstWindow, 'first-group');
    markWindowGroup(secondWindow, 'first-group');
    markWindowGroup(otherWindow, 'other-group');

    closeWindowGroup(firstWindow);

    expect(closeFirstWindow).toHaveBeenCalledTimes(1);
    expect(closeSecondWindow).toHaveBeenCalledTimes(1);
    expect(closeOtherWindow).not.toHaveBeenCalled();

    closeWindowGroup(otherWindow, { force: true });
  });

  test('force-destroys all windows in the same group', () => {
    const firstWindow = new BrowserWindow();
    const secondWindow = new BrowserWindow();
    const destroyFirstWindow = jest.spyOn(firstWindow, 'destroy');
    const destroySecondWindow = jest.spyOn(secondWindow, 'destroy');

    markWindowGroup(firstWindow, 'force-group');
    markWindowGroup(secondWindow, 'force-group');

    const remainingGroups = closeWindowGroup(firstWindow, { force: true });

    expect(destroyFirstWindow).toHaveBeenCalledTimes(1);
    expect(destroySecondWindow).toHaveBeenCalledTimes(1);
    expect(remainingGroups).toBe(0);
  });
});
