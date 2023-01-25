import { decodeHammingCode, encodeHammingCode } from "$src/coding-contracts/solutions/hammingCodes";
import { describe, expect, it } from "vitest";

describe("hammingCodes", () => {
  it("samples", () => {
    expect(encodeHammingCode(8)).toBe("11110000");
    expect(decodeHammingCode("11110000")).toBe("8");
    expect(decodeHammingCode("11110010")).toBe("8");

    expect(encodeHammingCode(21)).toBe("1001101011");
    expect(decodeHammingCode("1001101011")).toBe("21");
    expect(decodeHammingCode("1001101111")).toBe("21");
  });

  it("first 100", () => {
    for (let i = 8; i < 100; i++) {
      expect(decodeHammingCode(encodeHammingCode(i))).toBe("" + i);
    }
  });
});
