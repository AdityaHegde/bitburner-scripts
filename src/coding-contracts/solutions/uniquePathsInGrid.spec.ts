import {
  uniquePathsInGridV1,
  uniquePathsInGridV2,
} from "$src/coding-contracts/solutions/uniquePathsInGrid";
import { describe, expect, it } from "vitest";

const testCasesV1 = [
  { input: [7, 11], output: 8008 },
  { input: [10, 5], output: 715 },
  { input: [14, 10], output: 497420 },
  { input: [10, 2], output: 10 },
  { input: [2, 14], output: 14 },
  { input: [3, 9], output: 45 },
  { input: [4, 13], output: 455 },
];

const testCasesV2 = [
  {
    input: [
      [0, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
    ],
    output: 5,
  },
  {
    input: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    output: 202,
  },
  {
    input: [
      [0, 0],
      [0, 0],
      [0, 1],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 1],
      [0, 0],
      [0, 0],
      [1, 0],
      [0, 0],
    ],
    output: 2,
  },
  {
    input: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0],
      [1, 1, 0, 1, 1, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 1],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    output: 240,
  },
  {
    input: [
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    ],
    output: 102,
  },
];

describe("uniquePathsInGrid", () => {
  describe("Version1", () => {
    for (let i = 0; i < testCasesV1.length; i++) {
      it(`Case${i}`, () => {
        expect(uniquePathsInGridV1(testCasesV1[i].input as [number, number])).toBe(
          testCasesV1[i].output,
        );
      });
    }
  });

  describe("Version2", () => {
    for (let i = 0; i < testCasesV2.length; i++) {
      it(`Case${i}`, () => {
        expect(uniquePathsInGridV2(testCasesV2[i].input)).toBe(testCasesV2[i].output);
      });
    }
  });
});
