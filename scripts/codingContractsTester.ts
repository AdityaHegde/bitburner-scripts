import type { NS } from "$src/types/gameTypes";
import { CodingContractSolver } from "$src/coding-contracts/codingContractSolver";
import { Logger } from "$src/utils/logger/logger";
import { NameToSolutionFunction } from "$src/coding-contracts/solutions/solution";

export async function main(ns: NS) {
  const logger = Logger.ConsoleLogger(ns, "CodingContracts");
  const solver = new CodingContractSolver(ns, logger, true);

  let anyFailed = false;

  for (const problem in NameToSolutionFunction) {
    for (let i = 0; i < 100; i++) {
      ns.codingcontract.createDummyContract(problem);
    }

    const contractFiles = ns.ls("home", ".cct");
    const failedCount = await solver.solveContracts(
      contractFiles.map((contractFile) => [contractFile, "home"]),
    );
    logger.log("Finished", {
      problem,
      failedCount,
    });
    if (failedCount > 0) anyFailed = true;
  }

  if (anyFailed) {
    ns.tprintf("Some Failed\n");
  } else {
    ns.tprintf("All good\n");
  }
}
