import { runSolution } from "$src/coding-contracts/solutions/solution";
import { Minute, PlayerServerPrefix } from "$src/constants";
import type { RunnerModule } from "$src/runner/runner";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";

export class CodingContracts implements RunnerModule {
  private lastRun: number;
  private activeContracts = new Map<string, [contractFile: string, server: string]>();

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly allServers: Array<string>,
  ) {}

  public async run() {
    const now = Date.now();
    // run every 5 minutes
    if (now - this.lastRun < 5 * Minute) return;

    this.activeContracts.clear();

    for (const server of this.allServers) {
      this.checkServer(server);
    }

    this.solveContracts();

    this.lastRun = now;
  }

  private checkServer(server: string) {
    if (server.startsWith(PlayerServerPrefix)) return;
    const contractFiles = this.ns.ls(server, ".cct");
    for (const contractFile of contractFiles) {
      this.activeContracts.set(`${contractFile}-${server}`, [contractFile, server]);
    }
  }

  private solveContracts() {
    for (const [contractFile, server] of this.activeContracts.values()) {
      const name = this.ns.codingcontract.getContractType(contractFile, server);
      const input = this.ns.codingcontract.getData(contractFile, server);
      const output = runSolution(name, input);

      if (output === undefined) {
        this.logger.info("Unsolved", {
          server,
          name,
        });
        continue;
      }

      const reward = this.ns.codingcontract.attempt(output, contractFile, server);
      this.logger.info("Solved", {
        server,
        name,
        input,
        output,
        reward,
      });
    }
  }
}
