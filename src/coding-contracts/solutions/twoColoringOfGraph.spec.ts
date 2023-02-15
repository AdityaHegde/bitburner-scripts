import { describe, expect, it } from "vitest";
import { twoColoringOfGraph } from "$src/coding-contracts/solutions/twoColoringOfGraph";

const testCases: Array<{
  input: [number, Array<[number, number]>];
  output: Array<number>;
}> = [
  {
    input: [
      4,
      [
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
      ],
    ],
    output: [0, 0, 1, 1],
  },
  {
    input: [
      3,
      [
        [0, 1],
        [0, 2],
        [1, 2],
      ],
    ],
    output: [],
  },
  {
    input: [
      9,
      [
        [1, 2],
        [4, 8],
        [2, 8],
        [2, 5],
        [0, 3],
        [0, 6],
        [0, 4],
        [3, 5],
        [4, 7],
        [6, 8],
      ],
    ],
    output: [0, 0, 1, 1, 1, 0, 1, 0, 0],
  },
  {
    input: [
      9,
      [
        [3, 5],
        [0, 7],
        [2, 7],
        [2, 4],
        [7, 8],
        [4, 6],
        [0, 4],
        [0, 7],
      ],
    ],
    output: [0, 0, 0, 1, 1, 0, 0, 1, 0],
  },
  {
    input: [
      12,
      [
        [3, 6],
        [4, 7],
        [3, 10],
        [1, 7],
        [5, 11],
        [1, 5],
        [3, 11],
        [0, 7],
        [7, 10],
        [8, 10],
        [1, 2],
        [3, 4],
        [8, 11],
        [2, 11],
        [5, 6],
        [2, 4],
        [6, 7],
        [3, 9],
        [2, 9],
        [0, 5],
      ],
    ],
    output: [0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
  },
];

describe("twoColoringOfGraph", () => {
  for (const testCase of testCases) {
    it(`${testCase.input.join(",")}`, () => {
      expect(twoColoringOfGraph(testCase.input)).toEqual(testCase.output);
    });
  }
});
