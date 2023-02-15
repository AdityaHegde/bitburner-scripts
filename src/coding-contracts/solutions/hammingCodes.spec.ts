import { decodeHammingCode, encodeHammingCode } from "$src/coding-contracts/solutions/hammingCodes";
import { describe, expect, it } from "vitest";

function flipRandomBit(code: string) {
  const codeArray = code.split("");
  const index = Math.floor(Math.random() * codeArray.length);
  codeArray[index] = codeArray[index] === "0" ? "1" : "0";
  return codeArray.join("");
}

describe("hammingCodes", () => {
  it("samples", () => {
    expect(encodeHammingCode(8)).toBe("11110000");
    expect(decodeHammingCode("11110000")).toBe("8");
    expect(decodeHammingCode("11110010")).toBe("8");

    expect(encodeHammingCode(21)).toBe("1001101011");
    expect(decodeHammingCode("1001101011")).toBe("21");
    expect(decodeHammingCode("1001101111")).toBe("21");

    expect(encodeHammingCode(1745663695629)).toBe(
      "101101000101100111100011010101001001101100001101",
    );
    expect(decodeHammingCode(encodeHammingCode(1745663695629))).toBe("1745663695629");
  });

  it("first 100", () => {
    for (let i = 8; i < 100; i++) {
      const code = encodeHammingCode(i);
      expect(decodeHammingCode(code)).toBe("" + i);
      expect(decodeHammingCode(flipRandomBit(code))).toBe("" + i);
    }
  });
});
