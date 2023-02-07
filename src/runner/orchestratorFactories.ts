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
import { PrepOnlyRunner } from "$src/runner/ender/prepOnlyRunner";
import { MaxPlayerServerRunner } from "$src/runner/ender/maxPlayerServerRunner";
import { CodingContractSolver } from "$src/coding-contracts/codingContractSolver";
import { CodingContractsProcessor } from "$src/coding-contracts/codingContractsProcessor";
import { PerpetualRunner } from "$src/runner/ender/perpetualRunner";

export function getEarlyGameOrchestrator(ns: NS, scriptMem: number): Orchestrator {
  const logger = Logger.ConsoleLogger(ns, "EarlyGame");
  const { serverDataList, portCoordinator, scheduler } = getServerDataList(ns, logger, scriptMem);

  return new Orchestrator(ns, serverDataList, portCoordinator, scheduler, [
    new PlayerServers(ns, logger, serverDataList, 2 ** 16),
    new CodingContractScanner(ns, logger, serverDataList.allServers),
  ]);
}

export function getPrepOnlyOrchestrator(ns: NS, scriptMem: number): Orchestrator {
  const logger = Logger.ConsoleLogger(ns, "MidGame");
  const { serverDataList, targetList, portCoordinator, scheduler } = getServerDataList(
    ns,
    logger,
    scriptMem,
    "home",
    ns.getPurchasedServers(),
  );

  return new Orchestrator(
    ns,
    serverDataList,
    portCoordinator,
    scheduler,
    [],
    new PrepOnlyRunner(ns, serverDataList, targetList),
  );
}

export function getMaxPlayerServerOrchestrator(ns: NS, scriptMem: number): Orchestrator {
  const logger = Logger.ConsoleLogger(ns, "MidGame");
  const { serverDataList, portCoordinator, scheduler } = getServerDataList(
    ns,
    logger,
    scriptMem,
    "home",
    ns.getPurchasedServers(),
  );

  return new Orchestrator(
    ns,
    serverDataList,
    portCoordinator,
    scheduler,
    [
      new PlayerServers(ns, logger, serverDataList),
      new CodingContractsProcessor(
        ns,
        new CodingContractScanner(ns, logger, serverDataList.allServers),
        new CodingContractSolver(ns, logger),
      ),
    ],
    new MaxPlayerServerRunner(ns, serverDataList),
  );
}

export function getGenericMidGameOrchestrator(ns: NS, scriptMem: number): Orchestrator {
  const logger = Logger.ConsoleLogger(ns, "MidGame");
  const { serverDataList, portCoordinator, scheduler } = getServerDataList(
    ns,
    logger,
    scriptMem,
    "home",
    ns.getPurchasedServers(),
  );

  return new Orchestrator(
    ns,
    serverDataList,
    portCoordinator,
    scheduler,
    [
      new PlayerServers(ns, logger, serverDataList),
      new CodingContractsProcessor(
        ns,
        new CodingContractScanner(ns, logger, serverDataList.allServers),
        new CodingContractSolver(ns, logger),
      ),
    ],
    new PerpetualRunner(),
  );
}

function getServerDataList(
  ns: NS,
  logger: Logger,
  scriptMem: number,
  runner?: string,
  extraServers: Array<string> = [],
): {
  serverDataList: ServerDataList;
  targetList: TargetList;
  portCoordinator: PortCoordinator;
  scheduler: Scheduler;
} {
  const metadata = getMetadata(ns);
  const cracks = new Cracks(ns);
  const serverDataList = new ServerDataList(ns, logger, cracks, [
    ...metadata.newServers,
    ...extraServers,
  ]);

  runner ??= metadata.runnerServer;

  serverDataList.serverDataNameMap[runner].claimedMem += scriptMem;
  serverDataList.serverDataNameMap[runner].mem -= scriptMem;

  const targetList = new TargetList();

  const portCoordinator = new PortCoordinator(ns, serverDataList);
  const scheduler = new Scheduler(
    ns,
    logger,
    serverDataList,
    targetList,
    portCoordinator,
    new BatchCreator(ns, serverDataList),
    new ScriptScheduler(ns, logger, serverDataList, portCoordinator),
  );

  return { serverDataList, targetList, portCoordinator, scheduler };
}
