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

// TODO: add my own implementation
export const LempelZivCompression: SolutionFunction<string, string> = (plain) => {
  // for state[i][j]:
  //      if i is 0, we're adding a literal of length j
  //      else, we're adding a backreference of offset i and length j
  let cur_state: (string | null)[][] = Array.from(Array(10), () => Array(10).fill(null));
  let new_state: (string | null)[][] = Array.from(Array(10), () => Array(10));

  function set(state: (string | null)[][], i: number, j: number, str: string): void {
    const current = state[i][j];
    if (current == null || str.length < current.length) {
      state[i][j] = str;
    } else if (str.length === current.length && Math.random() < 0.5) {
      // if two strings are the same length, pick randomly so that
      // we generate more possible inputs to Compression II
      state[i][j] = str;
    }
  }

  // initial state is a literal of length 1
  cur_state[0][1] = "";

  for (let i = 1; i < plain.length; ++i) {
    for (const row of new_state) {
      row.fill(null);
    }
    const c = plain[i];

    // handle literals
    for (let length = 1; length <= 9; ++length) {
      const string = cur_state[0][length];
      if (string == null) {
        continue;
      }

      if (length < 9) {
        // extend current literal
        set(new_state, 0, length + 1, string);
      } else {
        // start new literal
        set(new_state, 0, 1, string + "9" + plain.substring(i - 9, i) + "0");
      }

      for (let offset = 1; offset <= Math.min(9, i); ++offset) {
        if (plain[i - offset] === c) {
          // start new backreference
          set(new_state, offset, 1, string + String(length) + plain.substring(i - length, i));
        }
      }
    }

    // handle backreferences
    for (let offset = 1; offset <= 9; ++offset) {
      for (let length = 1; length <= 9; ++length) {
        const string = cur_state[offset][length];
        if (string == null) {
          continue;
        }

        if (plain[i - offset] === c) {
          if (length < 9) {
            // extend current backreference
            set(new_state, offset, length + 1, string);
          } else {
            // start new backreference
            set(new_state, offset, 1, string + "9" + String(offset) + "0");
          }
        }

        // start new literal
        set(new_state, 0, 1, string + String(length) + String(offset));

        // end current backreference and start new backreference
        for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
          if (plain[i - new_offset] === c) {
            set(new_state, new_offset, 1, string + String(length) + String(offset) + "0");
          }
        }
      }
    }

    const tmp_state = new_state;
    new_state = cur_state;
    cur_state = tmp_state;
  }

  let result = null;

  for (let len = 1; len <= 9; ++len) {
    let string = cur_state[0][len];
    if (string == null) {
      continue;
    }

    string += String(len) + plain.substring(plain.length - len, plain.length);
    if (result == null || string.length < result.length) {
      result = string;
    } else if (string.length == result.length && Math.random() < 0.5) {
      result = string;
    }
  }

  for (let offset = 1; offset <= 9; ++offset) {
    for (let len = 1; len <= 9; ++len) {
      let string = cur_state[offset][len];
      if (string == null) {
        continue;
      }

      string += String(len) + "" + String(offset);
      if (result == null || string.length < result.length) {
        result = string;
      } else if (string.length == result.length && Math.random() < 0.5) {
        result = string;
      }
    }
  }

  return result ?? "";
};
