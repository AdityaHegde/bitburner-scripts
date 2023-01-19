import { CodingContracts } from "$src/coding-contracts/codingContracts";
import { getMetadata } from "$src/metadata/metadata";
import { Runner } from "$src/runner/runner";
import { Cracks } from "$src/servers/cracks";
import { HackCoordinator } from "$src/servers/hack/hackCoordinator";
import { PlayerServers } from "$src/servers/playerServers";
import { Servers } from "$src/servers/servers";
import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger";

export function getEarlyGameRunner(ns) {
  const metadata = getMetadata(ns);
  const logger = Logger.ConsoleLogger(ns, "EarlyGame");
  const cracks = new Cracks(ns);
  const servers = new Servers(ns, cracks, metadata.runnerServer, metadata.newServers);
  const hackCoordinator = new HackCoordinator(ns, logger, servers);
  const playerServers = new PlayerServers(ns, logger, servers);
  const codingContracts = new CodingContracts(ns, logger, servers);
  return new Runner(ns, logger, servers, hackCoordinator, playerServers, codingContracts);
}

export async function main(ns: NS) {
  const runner = getEarlyGameRunner(ns);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await runner.run();
    await ns.sleep(50);
  }
}
