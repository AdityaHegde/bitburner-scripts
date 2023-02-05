import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";
import { Heap } from "$src/utils/heap";

type VisitedNode = {
  x: number;
  y: number;
  key: string;
  distFromStart: number;
  distFromEnd: number;
  dir: string;
  from: VisitedNode;
};

function getPath(node: VisitedNode): string {
  let path = "";
  while (node) {
    path += node.dir;
    node = node.from;
  }
  return path;
}

export const shortestPath: SolutionFunction<Array<Array<number>>, string> = (input) => {
  const queue = new Heap<VisitedNode>(
    (a, b) => {
      if (a.distFromStart === b.distFromStart) {
        return b.distFromEnd - a.distFromEnd;
      }
      return a.distFromStart - b.distFromStart;
    },
    (a) => a.key,
  );
  queue.push({
    x: 0,
    y: 0,
    key: "0_0",
    distFromStart: 0,
    distFromEnd: input.length + input[0].length,
    dir: "",
    from: undefined,
  });

  const visited = new Set<string>();
  const endKey = `${input[0].length - 1}_${input.length - 1}`;

  const addIndex = (
    x: number,
    y: number,
    distFromStart: number,
    dir: string,
    from: VisitedNode,
  ) => {
    if (x < 0 || x >= input[0].length || y < 0 || y >= input.length || input[y][x] === 1) return;

    const key = `${x}_${y}`;
    if (visited.has(key)) return;

    const distFromEnd = input.length - y - 1 + (input[0].length - x - 1);
    if (queue.has(key)) {
      const existing = queue.get(key);
      if (existing.distFromStart < distFromStart) return;
      existing.distFromStart = distFromStart;
      existing.dir = dir;
      existing.from = from;
    } else {
      queue.push({
        x,
        y,
        key,
        distFromStart,
        distFromEnd,
        dir,
        from,
      });
    }
  };

  while (!queue.empty()) {
    const node = queue.pop();
    if (node.key === endKey) {
      return getPath(node);
    }
    visited.add(node.key);

    addIndex(node.x + 1, node.y, node.distFromStart + 1, "R", node);
    addIndex(node.x, node.y + 1, node.distFromStart + 1, "D", node);
    addIndex(node.x - 1, node.y, node.distFromStart + 1, "L", node);
    addIndex(node.x, node.y - 1, node.distFromStart + 1, "U", node);
  }

  return "";
};
