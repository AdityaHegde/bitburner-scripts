import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { NameToSolutionFunction } from "$src/coding-contracts/solutions/solution";
import type { CodingContractFile } from "$src/coding-contracts/codingContractScanner";

export const CodingContractWorkerScript = "codingContractWorker.js";

export class CodingContractSolver {
  public constructor(private readonly ns: NS, private readonly logger: Logger) {}

  public async solveContracts(contracts: Array<CodingContractFile>) {
    for (const contract of contracts) {
      await this.solveContract(contract);
    }
  }

  private async solveContract([contractFile, server]: CodingContractFile) {
    let name: string;
    let input: any;
    try {
      name = this.ns.codingcontract.getContractType(contractFile, server);
      input = this.ns.codingcontract.getData(contractFile, server);
    } catch (err) {
      this.logger.error("CodingContractError", {
        server,
        err: err.message,
      });
      return;
    }

    if (!NameToSolutionFunction[name]) {
      this.logger.info("Unsolved", {
        server,
        name,
      });
      return;
    }

    const workerCode = new Blob([this.ns.read(CodingContractWorkerScript)], {
      type: "application/javascript",
    });
    const worker = new Worker(URL.createObjectURL(workerCode));
    worker.postMessage([name, input]);
    const output = await new Promise<any>((resolve) => {
      worker.onmessage = (e) => {
        worker.terminate();
        resolve(e.data);
      };
    });

    try {
      const reward = this.ns.codingcontract.attempt(output, contractFile, server);
      this.logger.info("Solved", {
        server,
        name,
        input,
        output,
        reward,
      });
    } catch (err) {
      this.logger.error("CodingContractError", {
        server,
        name,
        input,
        output,
        err: err.message,
      });
    }
  }
}
