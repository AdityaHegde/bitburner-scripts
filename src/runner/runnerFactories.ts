import { CodingContracts } from "$src/coding-contracts/codingContracts";
import { HalfOfMaxServerSize } from "$src/constants";
import { getMetadata } from "$src/metadata/metadata";
import { BatchHackJobSelector } from "$src/runner/hackJobSelector/batchHackJobSelector";
import { HackJobSelector } from "$src/runner/hackJobSelector/hackJobSelector";
import { Runner } from "$src/runner/runner";
import { BatchScheduler } from "$src/runner/scheduler/batchScheduler";
import { Scheduler } from "$src/runner/scheduler/scheduler";
import { Cracks } from "$src/servers/cracks";
import { HackCoordinator } from "$src/servers/hack/hackCoordinator";
import { PlayerServers } from "$src/servers/playerServers";
import { Servers } from "$src/servers/servers";
import { Target } from "$src/servers/target";
import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger/logger";

export function getEarlyGameRunner(ns: NS) {
  const { logger, servers, hackCoordinator } = getCommon(ns, "EarlyGame");
  const hackJobSelector = new HackJobSelector(ns, logger, servers);
  const scheduler = new Scheduler(ns, logger, servers);

  const playerServers = new PlayerServers(ns, logger, servers, HalfOfMaxServerSize);
  return new Runner(ns, logger, servers, hackCoordinator, hackJobSelector, scheduler, [
    playerServers,
  ]);
}

export function getMidGameRunner(ns: NS) {
  const { metadata, logger, servers, hackCoordinator } = getCommon(ns, "EarlyGame");
  const hackJobSelector = new BatchHackJobSelector(ns, logger, servers);
  const scheduler = new BatchScheduler(ns, logger, servers);

  const playerServers = new PlayerServers(ns, logger, servers, HalfOfMaxServerSize << 4);
  const codingContracts = new CodingContracts(ns, logger, metadata.newServers);
  const runner = new Runner(ns, logger, servers, hackCoordinator, hackJobSelector, scheduler, [
    playerServers,
    codingContracts,
  ]);

  // add a target to share power
  const sharePowerTarget = Target.getSharePowerTarget(ns, logger);
  servers.addResource(sharePowerTarget.resource);
  servers.addTarget(sharePowerTarget);

  return runner;
}

function getCommon(ns: NS, label: string) {
  const metadata = getMetadata(ns);
  const logger = Logger.ConsoleLogger(ns, label);
  const cracks = new Cracks(ns);
  const servers = new Servers(ns, cracks, metadata.runnerServer, [...metadata.newServers]);
  const hackCoordinator = new HackCoordinator(ns, logger, servers);
  return { metadata, logger, servers, hackCoordinator };
}
