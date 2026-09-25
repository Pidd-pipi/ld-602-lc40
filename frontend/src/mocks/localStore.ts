/**
 * 本地持久化：离线评审时把种子数据深拷贝进 localStorage，
 * 移库的冻结、收货改账后刷新页面仍能复现状态。
 */
const PREFIX = "rescue-stock:";

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function loadCollection<T>(key: string, seed: readonly T[]): T[] {
  if (typeof localStorage === "undefined") return deepClone(seed) as T[];
  const storageKey = PREFIX + key;
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    try {
      return JSON.parse(raw) as T[];
    } catch {
      // 存储损坏时回退种子，避免整个页面白屏。
    }
  }
  const seeded = deepClone(seed) as T[];
  localStorage.setItem(storageKey, JSON.stringify(seeded));
  return seeded;
}

export function saveCollection<T>(key: string, rows: T[]): T[] {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(PREFIX + key, JSON.stringify(rows));
  }
  return rows;
}
