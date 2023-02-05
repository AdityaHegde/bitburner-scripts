import { describe, expect, it } from "vitest";
import { CeaserCipher, VigenereCipher } from "$src/coding-contracts/solutions/Ciphers";

const CeaserTestCases: Array<{ input: [string, number]; output: string }> = [
  {
    input: ["DASHBOARD", 3],
    output: "AXPEYLXOA",
  },
  {
    input: ["DASHBOARD", 5],
    output: "YVNCWJVMY",
  },
  {
    input: ["DASHBOARD", 26],
    output: "DASHBOARD",
  },
  {
    input: ["DASHBOARD WITH SPACE", 5],
    output: "YVNCWJVMY RDOC NKVXZ",
  },
];

describe("CeaserCipher", () => {
  for (const testCase of CeaserTestCases) {
    it(`${testCase.input[1]} << ${testCase.input[0]}`, () => {
      expect(CeaserCipher(testCase.input)).toBe(testCase.output);
    });
  }
});

const VigenereTestCases: Array<{ input: [string, string]; output: string }> = [
  {
    input: ["DASHBOARD", "LINUX"],
    output: "OIFBYZIEX",
  },
  {
    input: ["DASHBOARD", "WINDOWS"],
    output: "ZIFKPKSNL",
  },
  {
    input: ["DASHBOARD", "MAXOS"],
    output: "PAPVTAAOR",
  },
  {
    input: ["DASHBOARD WITH SPACE", "MAXOS"],
    output: "PAPVTAAOR IIQV EPXQW",
  },
];

describe("VigenèreCipher", () => {
  for (const testCase of VigenereTestCases) {
    it(`${testCase.input[0]} << ${testCase.input[1]}`, () => {
      expect(VigenereCipher(testCase.input)).toBe(testCase.output);
    });
  }
});
