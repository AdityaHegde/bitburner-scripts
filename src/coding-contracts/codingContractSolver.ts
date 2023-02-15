import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { NameToSolutionFunction } from "$src/coding-contracts/solutions/solution";
import type { CodingContractFile } from "$src/coding-contracts/codingContractScanner";

export const CodingContractWorkerScript = "codingContractWorker.js";

export class CodingContractSolver {
  private worker: Worker;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly cleanup = false,
  ) {}

  public async solveContracts(contracts: Array<CodingContractFile>): Promise<number> {
    const workerCode = new Blob([this.ns.read(CodingContractWorkerScript)], {
      type: "application/javascript",
    });
    this.worker = new Worker(URL.createObjectURL(workerCode));

    let failedCount = 0;
    for (const contract of contracts) {
      if (!(await this.solveContract(contract))) {
        failedCount++;
      }
    }

    this.worker.terminate();
    return failedCount;
  }

  private async solveContract([contractFile, server]: CodingContractFile): Promise<boolean> {
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
      return false;
    }

    if (!NameToSolutionFunction[name]) {
      this.logger.info("Unsolved", {
        server,
        name,
      });
      return false;
    }

    this.worker.postMessage([name, input]);
    const output = await new Promise<any>((resolve) => {
      this.worker.onmessage = (e) => {
        resolve(e.data);
      };
      this.worker.onerror = () => {
        resolve("");
      };
    });

    try {
      const reward = this.ns.codingcontract.attempt(output, contractFile, server);
      if (reward !== "") return true;
      this.logger.error("Incorrect", {
        server,
        name,
        input,
        output,
        reward,
      });

      if (this.cleanup) {
        this.ns.rm(contractFile, server);
      }
    } catch (err) {
      this.logger.error("CodingContractError", {
        server,
        name,
        input,
        output,
        err: err.message,
      });
    }

    return false;
  }
}
