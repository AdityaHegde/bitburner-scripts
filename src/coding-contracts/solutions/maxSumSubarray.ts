import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";
import { findInArray } from "$src/utils/arrayUtils";

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

  if (maxSum > 0) return maxSum;
  const [, largest] = findInArray(input, (a, b) => a > b);
  return largest;
};
