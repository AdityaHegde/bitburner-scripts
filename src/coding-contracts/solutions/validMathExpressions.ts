import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

function validMathExpressionsCore(
  input: string,
  index: number,
  expression: string,
  target: number,
  num: number,
  multiplied: number,
  solutions: Array<string>,
) {
  if (index === input.length) {
    if (num === target) solutions.push(expression);
    return;
  }

  for (let i = index; i < input.length; i++) {
    if (i !== index && input[index] === "0") break;
    const newNum = parseInt(input.substring(index, i + 1));

    if (index === 0) {
      validMathExpressionsCore(
        input,
        i + 1,
        expression + newNum,
        target,
        newNum,
        newNum,
        solutions,
      );
    } else {
      validMathExpressionsCore(
        input,
        i + 1,
        expression + "+" + newNum,
        target,
        num + newNum,
        newNum,
        solutions,
      );
      validMathExpressionsCore(
        input,
        i + 1,
        expression + "-" + newNum,
        target,
        num - newNum,
        -newNum,
        solutions,
      );
      validMathExpressionsCore(
        input,
        i + 1,
        expression + "*" + newNum,
        target,
        num - multiplied + multiplied * newNum,
        multiplied * newNum,
        solutions,
      );
    }
  }
}

export const validMathExpressions: SolutionFunction<[string, number], Array<string>> = ([
  input,
  target,
]) => {
  const solutions = new Array<string>();
  validMathExpressionsCore(input, 0, "", target, 0, 0, solutions);
  return solutions;
};
