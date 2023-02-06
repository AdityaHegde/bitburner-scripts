import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

function uniquePathsInGridCore(width: number, height: number, grid: Array<Array<number>>): number {
  const paths = new Array<Array<number>>(height).fill([]).map(() => new Array(width).fill(0));
  const list = new Array<[number, number]>([0, 0]);

  paths[0][0] = 1;

  const addNode = (i: number, j: number, cur) => {
    if (i === width || j === height || grid?.[j][i]) return;
    if (paths[j][i] === 0) list.push([i, j]);
    paths[j][i] += cur;
  };

  while (list.length > 0) {
    const [i, j] = list.shift();
    addNode(i + 1, j, paths[j][i]);
    addNode(i, j + 1, paths[j][i]);
  }

  return paths[height - 1][width - 1];
}

export const uniquePathsInGridV1: SolutionFunction<[number, number], number> = ([width, height]) =>
  uniquePathsInGridCore(width, height, undefined);

export const uniquePathsInGridV2: SolutionFunction<Array<Array<number>>, number> = (grid) =>
  uniquePathsInGridCore(grid[0].length, grid.length, grid);
