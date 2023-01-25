import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const lreCompression: SolutionFunction<string, string> = (input) => {
  let output = "";
  let prevCount = 0;
  let prev = "";

  for (const char of input) {
    if (prev && (char !== prev || prevCount === 9)) {
      output += prevCount + prev;
      prevCount = 0;
    }
    prev = char;
    prevCount++;
  }

  if (prevCount > 0) {
    output += prevCount + prev;
  }

  return output;
};
