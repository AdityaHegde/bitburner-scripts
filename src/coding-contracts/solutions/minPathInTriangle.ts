import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const minPathInTriangle: SolutionFunction<Array<Array<number>>, number> = (input) => {
  const costs = new Array<Array<number>>(input.length);

  const lastRowLength = input.length - 1;
  costs[lastRowLength] = new Array<number>(lastRowLength + 1);
  const lastRow = input[lastRowLength];
  // fill last row
  for (let j = 0; j < lastRow.length; j++) {
    costs[lastRowLength][j] = input[lastRowLength][j];
  }

  // start from last but one row
  for (let i = input.length - 2; i >= 0; i--) {
    costs[i] = new Array<number>(input[i].length);
    for (let j = 0; j < input[i].length; j++) {
      // add the current position cost and add the min of bottom and bottom right
      costs[i][j] = input[i][j] + Math.min(costs[i + 1][j], costs[i + 1][j + 1]);
    }
  }

  // return the cost of the top position
  return costs[0][0];
};
