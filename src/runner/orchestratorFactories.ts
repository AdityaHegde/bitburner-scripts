import { Orchestrator } from "$src/runner/orchestrator";
import { ServerDataList } from "$src/servers/serverDataList";
import type { NS } from "$src/types/gameTypes";
import { getMetadata } from "$src/metadata/metadata";
import { Cracks } from "$src/servers/cracks";
import { PortCoordinator } from "$src/runner/portCoordinator";
import { Scheduler } from "$src/runner/scheduler/scheduler";
import { Logger } from "$src/utils/logger/logger";
import { TargetList } from "$src/servers/targetList";
import { BatchCreator } from "$src/runner/batchCreator";
import { PlayerServers } from "$src/servers/playerServers";
import { CodingContractScanner } from "$src/coding-contracts/codingContractScanner";
import { ScriptScheduler } from "$src/runner/scheduler/scriptScheduler";

export function getEarlyGameOrchestrator(ns: NS, scriptMem: number): Orchestrator {
  const logger = Logger.ConsoleLogger(ns, "EarlyGame");
  const serverDataList = getServerDataList(ns, logger, scriptMem);
  const portCoordinator = new PortCoordinator(ns, serverDataList);
  const scheduler = new Scheduler(
    ns,
    logger,
    serverDataList,
    new TargetList(),
    portCoordinator,
    new BatchCreator(ns),
    new ScriptScheduler(ns, logger, serverDataList, portCoordinator),
  );
  return new Orchestrator(ns, serverDataList, portCoordinator, scheduler, [
    new PlayerServers(ns, logger, serverDataList, 2 ** 14),
    new CodingContractScanner(ns, logger, serverDataList.allServers),
  ]);
}

function getServerDataList(ns: NS, logger: Logger, scriptMem: number) {
  const metadata = getMetadata(ns);
  const cracks = new Cracks(ns);
  const serverDataList = new ServerDataList(ns, logger, cracks, metadata.newServers);

  serverDataList.serverDataNameMap[metadata.runnerServer].claimedMem += scriptMem;
  serverDataList.serverDataNameMap[metadata.runnerServer].mem -= scriptMem;

  return serverDataList;
}
