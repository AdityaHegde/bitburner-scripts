export function deepCopy(source: object, dest: object) {
  for (const k in source) {
    if (Object.hasOwn(source, k)) {
      dest[k] = source[k];
    }
  }
  // TODO: remove extra keys
}

export function copyArray<T extends object>(
  source: Array<T>,
  dest: Array<T>,
  keyGetter: (e: T) => string,
) {
  const existing = new Map<string, T>();
  for (const destEle of dest) {
    existing.set(keyGetter(destEle), destEle);
  }

  for (const sourceEle of source) {
    const sourceEleKey = keyGetter(sourceEle);
    if (existing.has(sourceEleKey)) {
      deepCopy(sourceEle, existing.get(sourceEleKey));
      existing.delete(sourceEleKey);
    } else {
      dest.push(sourceEle);
    }
  }

  for (const deleted of existing.values()) {
    dest.splice(dest.indexOf(deleted), 1);
  }
}

export function copyArrayToObject<T extends object>(
  source: Array<T>,
  dest: Record<string, T>,
  keyGetter: (e: T) => string,
) {
  const existing = new Map<string, T>();
  for (const destKey in dest) {
    existing.set(destKey, dest[destKey]);
  }

  for (const sourceEle of source) {
    const sourceEleKey = keyGetter(sourceEle);
    if (existing.has(sourceEleKey)) {
      deepCopy(sourceEle, existing.get(sourceEleKey));
      existing.delete(sourceEleKey);
    } else {
      dest[sourceEleKey] = sourceEle;
    }
  }

  for (const [key] of existing) {
    delete dest[key];
  }
}
