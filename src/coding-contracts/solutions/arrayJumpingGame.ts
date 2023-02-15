import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";
import { Heap } from "$src/utils/heap";

type Jump = {
  index: number;
  jumps: number;
  distance: number;
  heuristic: number;
};

// runs a A* algorithm
function arrayJumpingGameCore(input: Array<number>): number {
  const nextJump = new Heap<Jump>(
    (a, b) => {
      if (a.jumps === b.jumps) {
        return b.heuristic - a.heuristic;
      }
      return a.jumps - b.jumps;
    },
    (a) => "" + a.index,
  );
  nextJump.push({
    index: 0,
    jumps: 0,
    distance: input.length - 1,
    heuristic: input.length - 1 - input[0],
  });

  const visited = new Set<number>();

  while (!nextJump.empty()) {
    const jump = nextJump.pop();
    if (input[jump.index] >= jump.distance) return jump.jumps + 1;
    visited.add(jump.index);

    // go through all the nodes we can jump to
    for (let i = jump.index + 1; i <= jump.index + input[jump.index]; i++) {
      if (visited.has(i)) continue;

      const distance = input.length - 1 - i;
      const jumps = jump.jumps + 1;

      // if the node is not in the heap add it and continue
      if (!nextJump.has("" + i)) {
        nextJump.push({
          index: i,
          jumps,
          distance,
          heuristic: distance - input[i],
        });
        continue;
      }

      const existing = nextJump.get("" + i);
      // if existing jump is better or same the do nothing
      if (existing.jumps <= jumps) continue;

      // else updated the jumps to the new one
      existing.jumps = jumps;
      nextJump.updateItem(existing);
    }
  }

  return 0;
}

export const arrayJumpingGameV1: SolutionFunction<Array<number>, number> = (input) =>
  arrayJumpingGameCore(input) === 0 ? 0 : 1;

export const arrayJumpingGameV2: SolutionFunction<Array<number>, number> = (input) =>
  arrayJumpingGameCore(input);
