import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const encodeHammingCode: SolutionFunction<number, string> = (input) => {
  const inputBitCount = Math.ceil(Math.log2(input + 1));
  let parityBitCount = Math.ceil(Math.log2(inputBitCount));
  let codeSize = inputBitCount + parityBitCount + 1;
  // size correction
  if (2 ** parityBitCount < codeSize) {
    parityBitCount++;
    codeSize++;
  }

  const code = new Array<number>(codeSize).fill(0);
  let parity = 0;
  let ones = 0;

  for (let inputBit = inputBitCount - 1, bitIndex = 1; inputBit >= 0; bitIndex++) {
    const log = Math.log2(bitIndex);
    if (log === Math.floor(log)) {
      // if it is a parity bit position ignore
      continue;
    }

    const bit = (input & (2 ** inputBit)) === 0 ? 0 : 1;
    code[bitIndex] = bit;
    inputBit--;
    if (!bit) continue;

    // add to parity if it is a `1`
    parity ^= bitIndex;
    ones++;
  }

  for (let parityBitIndex = 0; parityBitIndex < parityBitCount; parityBitIndex++) {
    const bit = (parity & (2 ** parityBitIndex)) === 0 ? 0 : 1;
    code[2 ** parityBitIndex] = bit;
    if (bit) ones++;
  }

  code[0] = ones % 2 === 0 ? 0 : 1;

  return code.join("");
};

export const decodeHammingCode: SolutionFunction<string, string> = (input) => {
  let num = 0;
  let bitIndex = input.length - Math.ceil(Math.log2(input.length)) - 2;
  let parity = 0;

  for (let i = 1; i < input.length; i++) {
    if (input[i] === "1") {
      parity ^= i;
    }
    const log = Math.log2(i);
    if (log === Math.floor(log)) {
      // if it is a parity bit position ignore
      continue;
    }
    if (input[i] === "1") {
      num |= 2 ** bitIndex;
    }
    bitIndex--;
  }

  if (parity === 0) return "" + num;

  const numBitCount = Math.ceil(Math.log2(num));
  const effectiveIndex = parity - Math.ceil(Math.log2(parity)) - 1;
  const correction = 2 ** (numBitCount - effectiveIndex - 1);
  const bit = num & correction;
  if (bit === 0) num += correction;
  else num -= correction;

  return "" + num;
};
