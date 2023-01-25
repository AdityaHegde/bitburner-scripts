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

function waysToSumLimitedCore(
  num: number,
  allowedNumbers: Array<number>,
  maxIndex: number,
  cache: Map<[number, number], number>,
): number {
  if (num === 1) return 0;
  if (allowedNumbers[maxIndex] === 1) return 1;
  if (cache.has([num, maxIndex])) return cache.get([num, maxIndex]);

  let count = 1;
  // loop through the allowed numbers
  for (let i = 0; i <= maxIndex; i++) {
    const allowedNumber = allowedNumbers[maxIndex];
    if (allowedNumber > num) break;

    // keep taking away `allowedNumber` until num is <= 0
    let tempNum = num - allowedNumber;
    while (tempNum > 0) {
      // at every step
      count += waysToSumLimitedCore(tempNum, allowedNumbers, i - 1, cache);
      tempNum -= allowedNumber;
    }
  }

  cache.set([num, maxIndex], count);

  return count;
}

export const waysToSumLimited: SolutionFunction<[number, Array<number>], number> = ([
  num,
  allowedNumbers,
]) => waysToSumLimitedCore(num, allowedNumbers, allowedNumbers.length - 1, new Map());
