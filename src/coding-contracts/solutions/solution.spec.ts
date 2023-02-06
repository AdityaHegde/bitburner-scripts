import { describe, it } from "vitest";
import { runSolution } from "$src/coding-contracts/solutions/solution";

describe("AdHoc", () => {
  it("AdHocSolution", () => {
    console.log(
      runSolution(
        "Array Jumping Game II",
        [3, 3, 3, 2, 4, 3, 2, 4, 0, 4, 2, 3, 2, 3, 5, 1, 1, 2, 4, 1, 2, 4, 2, 2, 3],
      ),
    );
  });
});
