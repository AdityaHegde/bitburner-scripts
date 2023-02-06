import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

/**
 * Goes through all numbers < `num` and creates sub sums out of the remainder.
 * Uses a cache to avoid recomputing
 *
 * EG: 7 => 1+1+1+1+1+1+1
 *          Take 2 out => 2+1+1+1+1+1, 2+2+1+1+1, 2+2+2+1
 *          Take 3 out => 3+1+1+1+1, 3+2+1+1, 3+2+2, 3+3+1
 *          And so on...
 */
function waysToSumCore(num: number, maxPart: number, cache: Map<[number, number], number>): number {
  if (num === 1) return 0;
  if (maxPart === 1) return 1;
  if (cache.has([num, maxPart])) return cache.get([num, maxPart]);

  let count = 1;
  // loop through 2 to num-1
  for (let i = 2; i <= maxPart; i++) {
    // keep taking away `i` until num is <= 0
    let tempNum = num - i;
    while (tempNum > 0) {
      // at every step
      count += waysToSumCore(tempNum, Math.min(i - 1, tempNum - 1), cache) + (tempNum <= i ? 1 : 0);
      tempNum -= i;
    }
  }

  cache.set([num, maxPart], count);

  return count;
}

export const waysToSum: SolutionFunction<number, number> = (input) =>
  waysToSumCore(input, input - 1, new Map());

export const waysToSumLimited: SolutionFunction<[number, Array<number>], number> = ([
  num,
  allowedNumbers,
]) => {
  const cache = new Array<Array<number>>(num + 1)
    .fill([])
    .map(() => new Array<number>(allowedNumbers.length));

  // num = 0
  for (let i = 0; i < allowedNumbers.length; i++) {
    cache[0][i] = 1;
  }

  for (let curNum = 1; curNum <= num; curNum++) {
    for (let j = 0; j < allowedNumbers.length; j++) {
      cache[curNum][j] =
        // When `allowedNumbers[j]` is taken out of curNum
        (curNum - allowedNumbers[j] >= 0 ? cache[curNum - allowedNumbers[j]][j] : 0) +
        // When we try taking out `allowedNumbers[j-1]` keeping curNum as is
        (j >= 1 ? cache[curNum][j - 1] : 0);
    }
  }

  return cache[num][allowedNumbers.length - 1];
};
