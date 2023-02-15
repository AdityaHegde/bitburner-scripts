import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const waysToSum: SolutionFunction<number, number> = (num) => {
  const cache = new Array<number>(num + 1).fill(0);
  cache[0] = 1;

  for (let i = 1; i < num; i++) {
    for (let j = i; j <= num; j++) {
      cache[j] += cache[j - i];
    }
  }

  return cache[num];
};

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
