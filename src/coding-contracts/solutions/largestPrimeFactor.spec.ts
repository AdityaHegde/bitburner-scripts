import { largestPrimeFactor } from "$src/coding-contracts/solutions/largestPrimeFactor";
import { describe, expect, it } from "vitest";

const testCases = [
  { input: 785484550, output: 234473 },
  { input: 777986532, output: 2423 },
  { input: 166934276, output: 1399 },
  { input: 129829481, output: 25847 },
  { input: 862536428, output: 16587239 },
  { input: 1596174, output: 266029 },
  { input: 395033078, output: 17956049 },
];

describe("largestPrimeFactor", () => {
  for (const testCase of testCases) {
    it(`Largest Prime factor of ${testCase.input}`, () => {
      expect(largestPrimeFactor(testCase.input)).toBe(testCase.output);
    });
  }
});
