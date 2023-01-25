import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

function algorithmicStockTrader(
  prices: Array<number>,
  maxTransactions: number,
  transactions: number,
  startIndex: number,
) {
  // end condition
  if (maxTransactions !== -1 && transactions === maxTransactions) return 0;

  let buyIndex = startIndex;
  let lastMaxima = 0;
  let profit = 0;
  let i = buyIndex + 1;

  while (i < prices.length) {
    // go to the next local minima
    while (prices[i] <= prices[i - 1] && i < prices.length) {
      if (prices[buyIndex] > prices[i]) {
        // update buy index if a new minimum is found
        buyIndex = i;
        lastMaxima = 0;
      }
      i++;
    }

    // loop until we reach the local maxima
    while (prices[i] >= prices[i - 1] && i < prices.length) {
      i++;
    }

    // if the new maxima is less than the last maxima do not purchase
    if (prices[i - 1] < lastMaxima) continue;

    // buy at buyIndex and sell at i-1
    const newProfit =
      algorithmicStockTrader(prices, maxTransactions, transactions + 1, i) +
      (prices[i - 1] - prices[buyIndex]);
    if (newProfit > profit) {
      profit = newProfit;
    }
  }

  return profit;
}

export const algorithmicStockTraderV1: SolutionFunction<Array<number>, number> = (input) =>
  algorithmicStockTrader(input, 1, 0, 0);

export const algorithmicStockTraderV2: SolutionFunction<Array<number>, number> = (input) =>
  algorithmicStockTrader(input, -1, 0, 0);

export const algorithmicStockTraderV3: SolutionFunction<Array<number>, number> = (input) =>
  algorithmicStockTrader(input, 2, 0, 0);

export const algorithmicStockTraderV4: SolutionFunction<[number, Array<number>], number> = ([
  maxTransactions,
  input,
]) => algorithmicStockTrader(input, maxTransactions, 0, 0);
