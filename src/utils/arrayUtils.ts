export function findInArray<T>(
  arr: Array<T>,
  compare: (a: T, b: T) => boolean,
): [index: number, element: T] {
  if (arr.length === 0) return [-1, undefined];

  let foundIdx = 0;

  for (let i = 1; i < arr.length; i++) {
    if (compare(arr[i], arr[foundIdx])) {
      foundIdx = i;
    }
  }

  return [foundIdx, arr[foundIdx]];
}

export function binarySearch<T>(
  arr: Array<T>,
  compare: (mid: T) => number,
  low = 0,
  high = arr.length - 1,
): number {
  if (arr.length === 0) {
    return 0;
  }

  if (low > high) {
    return high;
  }

  const mid = Math.round((low + high) / 2);
  const cmp = compare(arr[mid]);

  if (cmp === 0) {
    return mid;
  } else if (cmp > 0) {
    return binarySearch(arr, compare, low, mid - 1);
  } else {
    return binarySearch(arr, compare, mid + 1, high);
  }
}

export function binaryInsert<T>(
  arr: Array<T>,
  ele: T,
  compare: (mid: T, ele: T) => number,
  low = 0,
  high = arr.length - 1,
): void {
  if (arr.length === 0) {
    arr.push(ele);
    return;
  }

  if (low > high) {
    arr.splice(low, 0, ele);
    return;
  }

  const mid = Math.round((low + high) / 2);
  const cmp = compare(arr[mid], ele);

  if (cmp === 0) {
    arr.splice(mid + 1, 0, ele);
  } else if (cmp > 0) {
    binaryInsert(arr, ele, compare, low, mid - 1);
  } else {
    binaryInsert(arr, ele, compare, mid + 1, high);
  }
}
