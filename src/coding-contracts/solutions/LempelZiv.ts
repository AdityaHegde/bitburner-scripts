import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const LempelZivDecompression: SolutionFunction<string, string> = (input) => {
  let mode = true;
  let output = "";

  for (let inputIdx = 0; inputIdx < input.length; inputIdx++) {
    const len = Number(input.charAt(inputIdx));
    if (len === 0) {
      mode = !mode;
      continue;
    }

    if (mode) {
      output += input.substring(inputIdx + 1, inputIdx + 1 + len);
      inputIdx += len;
      mode = false;
    } else {
      const places = Number(input.charAt(inputIdx + 1));
      let newOutputChunk = "";
      for (
        let repeatIdx = 0, placesIdx = 0;
        repeatIdx < len;
        repeatIdx++, placesIdx = (placesIdx + 1) % places
      ) {
        newOutputChunk += output.charAt(output.length - places + placesIdx);
      }
      output += newOutputChunk;
      inputIdx++;
      mode = true;
    }
  }

  return output;
};
