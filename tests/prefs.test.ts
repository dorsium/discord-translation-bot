import { promises as fs } from 'fs';
import { loadPrefs, getPref, setPref, PREFS_FILE } from '../src/prefs';

describe('prefs', () => {
  afterEach(async () => {
    await fs.unlink(PREFS_FILE).catch(() => {});
  });

  it('saves and loads preferences', async () => {
    await setPref('user1', false);
    await loadPrefs();
    expect(getPref('user1')).toBe(false);
  });
});
