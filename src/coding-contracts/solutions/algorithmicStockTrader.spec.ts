import {
  algorithmicStockTraderV1,
  algorithmicStockTraderV2,
  algorithmicStockTraderV3,
  algorithmicStockTraderV4,
} from "$src/coding-contracts/solutions/algorithmicStockTrader";
import { describe, expect, it } from "vitest";

const TestCases = [
  {
    input: [
      101, 22, 191, 49, 3, 21, 93, 155, 120, 49, 48, 34, 193, 52, 179, 89, 77, 98, 34, 189, 195, 71,
      175, 90, 40, 134, 98, 46, 91, 152, 2, 103, 174, 126, 82, 179, 172, 56, 145, 113, 165, 101,
      162, 55, 16, 164, 111,
    ],
    maxTransactions: 6,
    v1: 192,
    v2: 1712,
    v3: 369,
    v4: 972,
  },
  {
    input: [
      134, 63, 16, 197, 8, 88, 114, 60, 129, 59, 30, 25, 178, 197, 67, 195, 104, 90, 63, 84, 7, 185,
      4, 152, 27, 30, 141, 132, 118, 143, 124, 118, 9,
    ],
    maxTransactions: 5,
    v1: 189,
    v2: 1142,
    v3: 370,
    v4: 824,
  },
  {
    input: [
      192, 132, 155, 181, 174, 157, 67, 97, 10, 139, 39, 168, 158, 21, 74, 192, 163, 191, 161, 179,
      144, 35, 35, 197, 136, 17, 91, 92, 123, 94, 183, 114, 149, 119, 167, 66, 26, 174, 171, 84,
      159, 47, 37,
    ],
    maxTransactions: 7,
    v1: 187,
    v2: 1217,
    v3: 353,
    v4: 980,
  },
  {
    input: [
      178, 121, 85, 186, 5, 141, 45, 36, 157, 14, 110, 187, 185, 65, 40, 39, 55, 58, 33, 148, 99,
      119, 2, 77, 131, 74, 134, 77, 8, 130, 16, 6, 166, 46, 149, 28, 77,
    ],
    maxTransactions: 4,
    v1: 182,
    v2: 1308,
    v3: 346,
    v4: 617,
  },
  {
    input: [
      127, 97, 31, 57, 55, 183, 109, 77, 73, 43, 163, 195, 37, 57, 33, 29, 90, 84, 91, 27, 149, 20,
      16, 68, 28, 22, 191, 100, 181,
    ],
    maxTransactions: 3,
    v1: 175,
    v2: 818,
    v3: 339,
    v4: 479,
  },
  {
    input: [
      113, 53, 64, 66, 164, 188, 39, 106, 153, 58, 192, 47, 99, 79, 155, 131, 187, 78, 39, 112, 90,
      10, 160, 85, 114, 174, 105, 180, 38, 78, 163, 182, 121, 109, 176,
    ],
    maxTransactions: 3,
    v1: 172,
    v2: 1165,
    v3: 325,
    v4: 467,
  },
  {
    input: [134, 181, 115, 129, 165, 65],
    maxTransactions: 9,
    v1: 50,
    v2: 97,
    v3: 97,
    v4: 97,
  },
  {
    input: [
      140, 13, 49, 5, 178, 53, 64, 198, 18, 194, 47, 156, 23, 54, 60, 108, 76, 186, 94, 192, 107,
      181, 146, 60, 178, 163, 109, 64, 100, 21, 106, 49, 73, 104, 87,
    ],
    maxTransactions: 9,
    v1: 193,
    v2: 1300,
    v3: 369,
    v4: 1141,
  },
  {
    input: [
      4, 45, 67, 53, 167, 183, 78, 146, 32, 97, 121, 68, 167, 167, 121, 124, 101, 44, 58, 14, 141,
      2, 38, 177, 169, 195,
    ],
    maxTransactions: 8,
    v1: 193,
    v2: 794,
    v3: 372,
    v4: 783,
  },
  {
    input: [119, 86, 61, 29],
    maxTransactions: 8,
    v1: 0,
    v2: 0,
    v3: 0,
    v4: 0,
  },
];

describe("algorithmicStockTrader", () => {
  describe("Version 1", () => {
    for (const testCase of TestCases) {
      it(JSON.stringify(testCase.input), () => {
        expect(algorithmicStockTraderV1(testCase.input)).toBe(testCase.v1);
      });
    }
  });

  describe("Version 2", () => {
    for (const testCase of TestCases) {
      it(JSON.stringify(testCase.input), () => {
        expect(algorithmicStockTraderV2(testCase.input)).toBe(testCase.v2);
      });
    }
  });

  describe("Version 3", () => {
    for (const testCase of TestCases) {
      it(JSON.stringify(testCase.input), () => {
        expect(algorithmicStockTraderV3(testCase.input)).toBe(testCase.v3);
      });
    }
  });

  describe("Version 4", () => {
    for (const testCase of TestCases) {
      it(JSON.stringify(testCase.input), () => {
        expect(algorithmicStockTraderV4([testCase.maxTransactions, testCase.input])).toBe(
          testCase.v4,
        );
      });
    }
  });
});
