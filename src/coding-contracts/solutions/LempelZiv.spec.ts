import { describe, expect, it } from "vitest";
import { LempelZivDecompression } from "$src/coding-contracts/solutions/LempelZiv";

const testCases = [
  {
    raw: "aaabbaaababababaabb",
    compressed: "5aaabb450723abb",
  },
  {
    raw: "abracadabra",
    compressed: "7abracad47",
  },
  {
    raw: "mississippi",
    compressed: "4miss433ppi",
  },
  {
    raw: "aAAaAAaAaAA",
    compressed: "3aAA53035",
  },
  {
    raw: "2718281828",
    compressed: "627182844",
  },
  {
    raw: "abcdefghijk",
    compressed: "9abcdefghi02jk",
  },
  {
    raw: "aaaaaaaaaaaa",
    compressed: "3aaa91",
  },
  {
    raw: "aaaaaaaaaaaaa",
    compressed: "1a91031",
  },
  {
    raw: "aaaaaaaaaaaaaa",
    compressed: "1a91041",
  },
];

describe("LempelZiv", () => {
  describe("Decompression", () => {
    for (const testCase of testCases) {
      it(`${testCase.compressed} ==> ${testCase.raw}`, () => {
        expect(LempelZivDecompression(testCase.compressed)).toBe(testCase.raw);
      });
    }
  });
});
