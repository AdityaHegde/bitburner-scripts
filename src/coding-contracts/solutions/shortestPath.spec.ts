import { describe, expect, it } from "vitest";
import { shortestPath } from "$src/coding-contracts/solutions/shortestPath";

const testCases = [
  {
    input: [
      [0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0],
    ],
    output: "DRRURRD",
  },
  {
    input: [
      [0, 1],
      [1, 0],
    ],
    output: "",
  },
  {
    input: [
      [0, 1, 0, 1, 1, 1, 0, 1],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 1, 0, 0, 0, 0],
    ],
    output: "DRRDDRDRDDRRRD",
  },
  {
    input: [
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    ],
    output: "",
  },
];

describe("shortestPath", () => {
  for (let i = 0; i < testCases.length; i++) {
    it(`Case_${i}`, () => {
      expect(shortestPath(testCases[i].input)).toBe(testCases[i].output);
    });
  }
});
