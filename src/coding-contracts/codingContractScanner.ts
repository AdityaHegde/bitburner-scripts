import type { NS } from "$src/types/gameTypes";
import { Minute, PlayerServerPrefix } from "$src/constants";
import { OrchestratorModule } from "$src/runner/orchestratorModule";
import { ScriptSchedule } from "$src/runner/scheduler/scriptSchedule";
import type { Logger } from "$src/utils/logger/logger";

export const CodingContractSolverScript = "codingContracts.js";
export const CodingContractSolverScore = 100;
export type CodingContractFile = [contractFile: string, server: string];

export class CodingContractScanner extends OrchestratorModule {
  public activeContracts = new Map<string, CodingContractFile>();
  private lastRun: number;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly allServers: Array<string>,
  ) {
    super();
  }

  public async process(): Promise<void> {
    const now = Date.now();
    // run every 5 minutes
    if (now - this.lastRun < 5 * Minute) return;

    this.activeContracts.clear();

    for (const server of this.allServers) {
      this.checkServer(server);
    }
    if (this.activeContracts.size > 0) {
      const contracts = [...this.activeContracts.values()];
      this.logger.info("Contracts", { contracts });
      this.emit(
        "schedule",
        new ScriptSchedule(
          this.ns,
          CodingContractSolverScript,
          [JSON.stringify(contracts)],
          CodingContractSolverScore,
        ),
      );
    }

    this.lastRun = now;
  }

  private checkServer(server: string) {
    if (server.startsWith(PlayerServerPrefix)) return;
    const contractFiles = this.ns.ls(server, ".cct");
    for (const contractFile of contractFiles) {
      this.activeContracts.set(`${contractFile}-${server}`, [contractFile, server]);
    }
  }
}
