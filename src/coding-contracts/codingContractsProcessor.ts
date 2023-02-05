import type { NS } from "$src/types/gameTypes";
import type { CodingContractScanner } from "$src/coding-contracts/codingContractScanner";
import type { CodingContractSolver } from "$src/coding-contracts/codingContractSolver";

export class CodingContractsProcessor {
  public constructor(
    private readonly ns: NS,
    private readonly scanner: CodingContractScanner,
    private readonly solver: CodingContractSolver,
  ) {}

  public async process() {
    await this.scanner.process();
    if (this.scanner.activeContracts.size === 0) return;

    await this.solver.solveContracts([...this.scanner.activeContracts.values()]);
  }
}
