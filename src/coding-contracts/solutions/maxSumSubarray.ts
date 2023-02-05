import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const maxSumSubarray: SolutionFunction<Array<number>, number> = (input) => {
  let maxSum = 0;
  let sum = 0;

  for (let i = 0; i < input.length; i++) {
    sum += input[i];
    if (sum < 0) {
      sum = 0;
    } else if (sum > maxSum) {
      maxSum = sum;
    }
  }

  return maxSum;
};
