import { waysToSum, waysToSumLimited } from "$src/coding-contracts/solutions/waysToSum";
import { describe, expect, it } from "vitest";

const testCasesV1 = [
  { input: 3, output: 2 },
  { input: 4, output: 4 },
  { input: 5, output: 6 },
  { input: 6, output: 10 },
  { input: 22, output: 1001 },
  { input: 23, output: 1254 },
  { input: 34, output: 12309 },
  { input: 70, output: 4087967 },
  { input: 80, output: 15796475 },
  { input: 81, output: 18004326 },
];

const testCasesV2 = [
  {
    input: [139, [2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 16, 17]],
    output: 1000,
  },
];

describe("waysToSum", () => {
  describe("Version1", () => {
    for (const testCase of testCasesV1) {
      it(`waysToSum(${testCase.input})`, () => {
        expect(waysToSum(testCase.input)).toBe(testCase.output);
      });
    }
  });

  describe("Version2", () => {
    for (const testCase of testCasesV2) {
      it(`waysToSumLimited(${testCase.input})`, () => {
        expect(waysToSumLimited(testCase.input as any)).toBe(testCase.output);
      });
    }
  });
});
