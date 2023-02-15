import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const encodeHammingCode: SolutionFunction<number, string> = (input) => {
  const inputBitCount = Math.ceil(Math.log2(input + 1));
  let parityBitCount = Math.ceil(Math.log2(inputBitCount));
  let codeSize = inputBitCount + parityBitCount + 1;
  // size correction
  while (2 ** parityBitCount < codeSize) {
    parityBitCount++;
    codeSize++;
  }

  // we need to do this because input could be > MaxSafeInt
  const inputBits = input.toString(2).split("");

  const code = new Array<number>(codeSize).fill(0);
  let parity = 0;
  let ones = 0;

  for (let inputBit = 0, bitIndex = 1; inputBit < inputBits.length; bitIndex++) {
    const log = Math.log2(bitIndex);
    if (log === Math.floor(log)) {
      // if it is a parity bit position ignore
      continue;
    }

    const bit = inputBits[inputBit] === "0" ? 0 : 1;
    code[bitIndex] = bit;
    inputBit++;
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
  let parity = 0;

  // we have to do this instead of directly writing to a number because the output could be larger than MaxSafeInt
  const bits = new Array(input.length);

  for (let i = 0; i < input.length; i++) {
    bits[i] = input[i] === "1" ? 1 : 0;
    if (bits[i]) {
      parity ^= i;
    }
  }

  if (parity) {
    bits[parity] = bits[parity] ? 0 : 1;
  }

  const nums = new Array<string>();

  for (let i = 0; i < bits.length; i++) {
    const log = Math.log2(i);
    if (log === Math.floor(log)) {
      // if it is a parity bit position ignore
      continue;
    }
    nums.push(bits[i] ? "1" : "0");
  }

  return "" + parseInt(nums.join(""), 2);
};
