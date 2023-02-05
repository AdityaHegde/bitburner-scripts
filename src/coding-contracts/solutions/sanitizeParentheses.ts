import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

// TODO: skip removing successive brackets in a sequence and perhaps get rid of the `solutions` set
function removeExtraParentheses(
  input: string,
  index: number,
  addedLefts: number,
  extraLefts: number,
  extraRights: number,
  solution: string,
  solutions: Set<string>,
) {
  if (index === input.length) {
    if (addedLefts !== 0 || extraLefts !== 0 || extraRights !== 0) return;
    solutions.add(solution);
    return;
  }

  if (input[index] === "(") {
    if (extraLefts > 0) {
      // remove the left bracket
      removeExtraParentheses(
        input,
        index + 1,
        addedLefts,
        extraLefts - 1,
        extraRights,
        solution,
        solutions,
      );
    }
    // add the left bracket
    removeExtraParentheses(
      input,
      index + 1,
      addedLefts + 1,
      extraLefts,
      extraRights,
      solution + input[index],
      solutions,
    );
  } else if (input[index] === ")") {
    if (extraRights > 0) {
      // remove the right bracket
      removeExtraParentheses(
        input,
        index + 1,
        addedLefts,
        extraLefts,
        extraRights - 1,
        solution,
        solutions,
      );
    }
    if (addedLefts > 0) {
      // add the right bracket
      removeExtraParentheses(
        input,
        index + 1,
        addedLefts - 1,
        extraLefts,
        extraRights,
        solution + input[index],
        solutions,
      );
    }
  } else {
    // add any non bracket character
    removeExtraParentheses(
      input,
      index + 1,
      addedLefts,
      extraLefts,
      extraRights,
      solution + input[index],
      solutions,
    );
  }
}

export const sanitizeParentheses: SolutionFunction<string, Array<string>> = (input) => {
  let strippedInput = "";
  // strip leading open brackets and trailing closed brackets
  let beg = 0;
  for (; beg < input.length && input[beg] !== "("; beg++) {
    // add any characters
    if (input[beg] !== ")") strippedInput += input[beg];
  }

  let trailingChars = "";
  let end = input.length - 1;
  for (; end >= beg && input[end] !== ")"; end--) {
    // add any characters
    if (input[end] !== "(") trailingChars += input[end];
  }
  strippedInput += input.substring(beg, end + 1) + trailingChars;

  // calculate extra left and right brackets
  let extraLefts = 0;
  let extraRights = 0;
  for (let i = 0; i < strippedInput.length; i++) {
    if (strippedInput[i] === "(") extraLefts++;
    else if (strippedInput[i] === ")") {
      if (extraLefts > 0) extraLefts--;
      else extraRights++;
    }
  }

  const solutions = new Set<string>();

  removeExtraParentheses(strippedInput, 0, 0, extraLefts, extraRights, "", solutions);

  return [...solutions.values()];
};
