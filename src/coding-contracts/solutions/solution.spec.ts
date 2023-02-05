import { describe, it } from "vitest";
import { runSolution } from "$src/coding-contracts/solutions/solution";

describe("AdHoc", () => {
  it("AdHocSolution", () => {
    console.log(
      runSolution(
        "HammingCodes: Encoded Binary to Integer",
        "0010010001101001100000010111011111011001111111110000110010001000",
      ),
    );
  });
});
