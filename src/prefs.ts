import { promises as fs } from 'fs';

export const PREFS_FILE = './.prefs.json';

export type UserPrefs = Map<string, boolean>;

const prefs: UserPrefs = new Map();

export async function loadPrefs(): Promise<UserPrefs> {
  try {
    const raw = await fs.readFile(PREFS_FILE, 'utf8');
    const data: [string, boolean][] = JSON.parse(raw);
    data.forEach(([key, val]) => prefs.set(key, val));
    console.log(`🔄 Loaded ${prefs.size} user preference(s) from file.`);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('⚠️ Failed to load user preferences:', err);
    }
  }
  return prefs;
}

export function getPref(userId: string): boolean | undefined {
  return prefs.get(userId);
}

export async function setPref(userId: string, value: boolean): Promise<void> {
  prefs.set(userId, value);
  try {
    const jsonData = JSON.stringify([...prefs], null, 2);
    await fs.writeFile(PREFS_FILE, jsonData, 'utf8');
    console.log(`💾 Saved prefs for ${userId}: ${value}`);
  } catch (err) {
    console.error('❌ Failed to save user preferences:', err);
  }
}
