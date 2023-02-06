import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

const CapsACharCode = "A".charCodeAt(0);
const CharsSize = 26;
const SpaceCharCode = " ".charCodeAt(0);

function shiftLeft(charCode: number, shift: number) {
  return String.fromCharCode(
    ((charCode + CharsSize - shift - CapsACharCode) % CharsSize) + CapsACharCode,
  );
}

function shiftRight(charCode: number, shift: number) {
  return String.fromCharCode(((charCode + shift - CapsACharCode) % CharsSize) + CapsACharCode);
}

export const CeaserCipher: SolutionFunction<[string, number], string> = ([plaintext, shift]) => {
  let ciphertext = "";
  for (let i = 0; i < plaintext.length; i++) {
    const charCode = plaintext.charCodeAt(i);
    if (charCode === SpaceCharCode) {
      ciphertext += " ";
      continue;
    }
    ciphertext += shiftLeft(charCode, shift);
  }
  return ciphertext;
};

export const VigenereCipher: SolutionFunction<[string, string], string> = ([
  plaintext,
  keyword,
]) => {
  let ciphertext = "";

  for (let i = 0, k = 0; i < plaintext.length; i++, k = (k + 1) % keyword.length) {
    const charCode = plaintext.charCodeAt(i);
    if (charCode === SpaceCharCode) {
      ciphertext += " ";
      continue;
    }
    const keywordCode = keyword.charCodeAt(k);
    ciphertext += shiftRight(charCode, keywordCode - CapsACharCode);
  }

  return ciphertext;
};
