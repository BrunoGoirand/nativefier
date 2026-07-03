import { randomUUID } from 'crypto';

import { BrowserWindow } from 'electron';

let groupByWindow = new WeakMap<BrowserWindow, string>();
let windowsByGroup = new Map<string, Set<BrowserWindow>>();

export function createWindowGroupId(): string {
  return randomUUID();
}

export function markWindowGroup(
  window: BrowserWindow,
  groupId = createWindowGroupId(),
): string {
  const previousGroupId = groupByWindow.get(window);
  if (previousGroupId) {
    windowsByGroup.get(previousGroupId)?.delete(window);
  }

  groupByWindow.set(window, groupId);

  let group = windowsByGroup.get(groupId);
  if (!group) {
    group = new Set();
    windowsByGroup.set(groupId, group);
  }
  group.add(window);

  window.once('closed', () => {
    group?.delete(window);
    if (group?.size === 0) {
      windowsByGroup.delete(groupId);
    }
  });

  return groupId;
}

export function getWindowGroupId(window: BrowserWindow): string | undefined {
  return groupByWindow.get(window);
}

export function closeWindowGroup(
  window: BrowserWindow,
  options: { force?: boolean } = {},
): number {
  const groupId = groupByWindow.get(window);
  if (!groupId) {
    if (options.force) {
      window.destroy();
    } else {
      window.close();
    }
    return windowsByGroup.size;
  }

  const group = windowsByGroup.get(groupId);
  if (!group) {
    if (options.force) {
      window.destroy();
    } else {
      window.close();
    }
    return windowsByGroup.size;
  }

  if (options.force) {
    windowsByGroup.delete(groupId);
  }

  for (const windowInGroup of [...group]) {
    if (options.force) {
      windowInGroup.destroy();
    } else {
      windowInGroup.close();
    }
  }

  return windowsByGroup.size;
}

export function resetWindowGroupsForTests(): void {
  groupByWindow = new WeakMap<BrowserWindow, string>();
  windowsByGroup = new Map<string, Set<BrowserWindow>>();
}
