import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

export const twoColoringOfGraph: SolutionFunction<
  [number, Array<[number, number]>],
  Array<number>
> = ([vertices, edges]) => {
  const graph = new Array<Array<number>>(vertices)
    .fill([])
    .map(() => new Array<number>(vertices).fill(0));
  const coloring = new Array<number>(vertices).fill(-1);

  for (const [v1, v2] of edges) {
    graph[v1][v2] = 1;
    graph[v2][v1] = 1;
  }

  const queue = new Array<number>();
  queue.push(0);
  coloring[0] = 0;

  const notVisited = new Set<number>();
  for (let i = 1; i < vertices; i++) {
    notVisited.add(i);
  }

  while (queue.length > 0 || notVisited.size > 0) {
    const vertex = queue.shift();
    notVisited.delete(vertex);
    const color = coloring[vertex] === 0 ? 1 : 0;

    for (let ne = 0; ne < vertices; ne++) {
      if (ne === vertex || graph[vertex][ne] === 0) continue;
      if (coloring[ne] === -1) {
        coloring[ne] = color;
        queue.push(ne);
      } else if (coloring[ne] !== color) return [];
    }

    if (queue.length === 0 && notVisited.size > 0) queue.push([...notVisited][0]);
  }

  for (let i = 0; i < coloring.length; i++) {
    if (coloring[i] === -1) coloring[i] = 0;
  }

  return coloring;
};
