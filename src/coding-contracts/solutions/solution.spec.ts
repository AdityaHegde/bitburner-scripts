import { describe, it } from "vitest";
import { runSolution } from "$src/coding-contracts/solutions/solution";

// For adhoc solutions and testing
describe("AdHoc", () => {
  it("AdHocSolution", () => {
    console.log(runSolution("HammingCodes: Integer to Encoded Binary", 3));
  });
});
