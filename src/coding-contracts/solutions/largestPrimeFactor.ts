import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const largestPrimeFactor: SolutionFunction<number, number> = (input) => {
  let num = input;
  // even numbers cannot be prime factors so divide by 2 until it is not even
  while (num % 2 === 0) {
    num /= 2;
  }
  // 2 is the smallest factor
  if (num === 1) return 2;

  let largestFactor = 3;
  // Start from the smallest odd number and take all orders of it out
  for (let factor = 3; factor <= Math.sqrt(num); factor += 2) {
    while (num % factor === 0) {
      largestFactor = factor;
      num /= factor;
    }
  }

  // num ended up being a prime number that is larger that the final factor
  if (num > largestFactor) return num;
  // otherwise it was last divided by the largest factor
  return largestFactor;
};
