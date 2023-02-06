import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const spiralizeMatrix: SolutionFunction<Array<Array<number>>, Array<number>> = (input) => {
  let dx = input[0].length;
  // start x from -1 to make things nice and easy
  let x = -1;
  let dirX = 1;

  // because we already add the final entry in the row, only need to run length-1 times for y
  let dy = input.length - 1;
  let y = 0;
  let dirY = 1;

  let i = 0;
  const output = new Array<number>(dx * dy + 1);

  // run until we cannot move in x direction
  while (dx > 0 && dy >= 0) {
    for (let dxCur = 0; dxCur < dx; dxCur++) {
      x += dirX;
      output[i++] = input[y][x];
    }
    // decrement x diff and flip direction
    dx--;
    dirX = dirX === 1 ? -1 : 1;

    for (let dyCur = 0; dyCur < dy; dyCur++) {
      y += dirY;
      output[i++] = input[y][x];
    }
    // decrement y diff and flip direction
    dy--;
    dirY = dirY === 1 ? -1 : 1;
  }

  return output;
};
