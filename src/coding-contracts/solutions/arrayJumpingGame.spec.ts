import {
  arrayJumpingGameV1,
  arrayJumpingGameV2,
} from "$src/coding-contracts/solutions/arrayJumpingGame";
import { describe, expect, it } from "vitest";

function solver(data: number[]) {
  const n: number = data.length;
  let reach = 0;
  let jumps = 0;
  let lastJump = -1;
  while (reach < n - 1) {
    let jumpedFrom = -1;
    for (let i = reach; i > lastJump; i--) {
      if (i + data[i] > reach) {
        reach = i + data[i];
        jumpedFrom = i;
      }
    }
    if (jumpedFrom === -1) {
      jumps = 0;
      break;
    }
    lastJump = jumpedFrom;
    jumps++;
  }
  return jumps;
}

const testCases = [
  {
    input: [0, 0, 6, 9, 1, 4, 7, 0, 2, 10, 0, 9, 1, 1, 0, 0, 10, 7, 5, 0, 0],
    v1: 0,
    v2: 0,
  },
  { input: [0, 5, 1], v1: 0, v2: 0 },
  { input: [8, 6, 5, 0, 1, 1, 0, 8, 0, 8, 10, 4, 1, 5], v1: 1, v2: 2 },
  { input: [0, 0, 0, 4, 0, 0, 0, 0, 7], v1: 0, v2: 0 },
  { input: [5, 2, 6, 0], v1: 1, v2: 1 },
  { input: [7, 0, 4, 9, 6, 4, 6, 10, 0, 1, 0, 4, 0, 0, 4], v1: 1, v2: 2 },
  { input: [9, 0, 7, 0, 6, 4, 7, 2], v1: 1, v2: 1 },
  { input: [7, 8, 1, 0, 4, 8, 10, 9, 8, 10, 8, 8, 9, 6, 7], v1: 1, v2: 2 },
  {
    input: [3, 3, 3, 2, 4, 3, 2, 4, 0, 4, 2, 3, 2, 3, 5, 1, 1, 2, 4, 1, 2, 4, 2, 2, 3],
    v1: 1,
    v2: 8,
  },
  {
    input: [3, 0, 4, 7, 4, 2, 0, 3, 0, 0, 0],
    v1: 1,
    v2: 2,
  },
];

describe("arrayJumpingGame", () => {
  describe("Version1", () => {
    for (const testCase of testCases) {
      it(JSON.stringify(testCase.input), () => {
        expect(arrayJumpingGameV1(testCase.input)).toBe(testCase.v1);
      });
    }
  });

  describe("Version2", () => {
    for (const testCase of testCases) {
      it(JSON.stringify(testCase.input), () => {
        console.log(solver(testCase.input));
        expect(arrayJumpingGameV2(testCase.input)).toBe(testCase.v2);
      });
    }
  });
});
