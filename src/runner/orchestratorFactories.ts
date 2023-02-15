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
import { CodingContractScanner } from "$src/coding-contracts/codingContractScanner";
import { ScriptScheduler } from "$src/runner/scheduler/scriptScheduler";
import { PrepOnlyRunner } from "$src/runner/ender/prepOnlyRunner";
import { MaxPlayerServerRunner } from "$src/runner/ender/maxPlayerServerRunner";
import { CodingContractSolver } from "$src/coding-contracts/codingContractSolver";
import { CodingContractsProcessor } from "$src/coding-contracts/codingContractsProcessor";
import { PerpetualRunner } from "$src/runner/ender/perpetualRunner";
import { Purchaser } from "$src/purchaser/Purchaser";
import { PlayerServerPurchaser } from "$src/purchaser/PlayerServerPurchaser";
import { CracksPurchaser } from "$src/purchaser/CracksPurchaser";
import { ExploitedTORAutomation } from "$src/automation/exploits/ExploitedTORAutomation";
import { FormulaPurchaser } from "$src/purchaser/FormulaPurchaser";
import { config } from "$src/config";
import type { PurchaserModule } from "$src/purchaser/PurchaserModule";
import type { OrchestratorModule } from "$src/runner/orchestratorModule";

export function getEarlyGameOrchestrator(ns: NS, scriptMem: number): Orchestrator {
  const logger = Logger.ConsoleLogger(ns, "Runner");
  const { serverDataList, portCoordinator, scheduler } = getServerDataList(ns, logger, scriptMem);

  const cracksAutomation = new ExploitedTORAutomation();

  return new Orchestrator(ns, serverDataList, portCoordinator, scheduler, [
    ...getPurchaser(ns, logger, serverDataList, [
      new PlayerServerPurchaser(ns, logger, serverDataList),
      new CracksPurchaser(ns, logger, serverDataList, cracksAutomation),
      new FormulaPurchaser(ns, logger, cracksAutomation),
    ]),
    new CodingContractScanner(ns, logger, serverDataList.allServers),
  ]);
}

export function getPrepOnlyOrchestrator(ns: NS, scriptMem: number): Orchestrator {
  const logger = Logger.ConsoleLogger(ns, "MidGame");
  const { serverDataList, targetList, portCoordinator, scheduler } = getServerDataList(
    ns,
    logger,
    scriptMem,
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
  const { serverDataList, portCoordinator, scheduler } = getServerDataList(ns, logger, scriptMem);

  return new Orchestrator(
    ns,
    serverDataList,
    portCoordinator,
    scheduler,
    [
      ...getPurchaser(ns, logger, serverDataList, [
        new PlayerServerPurchaser(ns, logger, serverDataList),
      ]),
      new CodingContractsProcessor(
        ns,
        new CodingContractScanner(ns, logger, serverDataList.allServers),
        new CodingContractSolver(ns, logger),
      ),
    ],
    new MaxPlayerServerRunner(ns, serverDataList),
  );
}

export function getGenericMidGameOrchestrator(
  ns: NS,
  scriptMem: number,
  additionalModules: Array<OrchestratorModule> = [],
): Orchestrator {
  const logger = Logger.ConsoleLogger(ns, "MidGame");
  const { serverDataList, portCoordinator, scheduler } = getServerDataList(ns, logger, scriptMem);

  return new Orchestrator(
    ns,
    serverDataList,
    portCoordinator,
    scheduler,
    [
      ...getPurchaser(ns, logger, serverDataList, [
        new CracksPurchaser(ns, logger, serverDataList, new ExploitedTORAutomation()),
        new PlayerServerPurchaser(ns, logger, serverDataList),
      ]),
      new CodingContractsProcessor(
        ns,
        new CodingContractScanner(ns, logger, serverDataList.allServers),
        new CodingContractSolver(ns, logger),
      ),
      ...additionalModules,
    ],
    new PerpetualRunner(),
  );
}

export function getServerDataList(
  ns: NS,
  logger: Logger,
  scriptMem: number,
): {
  serverDataList: ServerDataList;
  targetList: TargetList;
  portCoordinator: PortCoordinator;
  scheduler: Scheduler;
} {
  const metadata = getMetadata(ns);
  const cracks = new Cracks(ns);
  const serverDataList = new ServerDataList(ns, logger, cracks, metadata.newServers);

  serverDataList.serverDataNameMap[metadata.runnerServer].claimedMem += scriptMem;
  serverDataList.serverDataNameMap[metadata.runnerServer].mem -= scriptMem;

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

function getPurchaser(
  ns: NS,
  logger: Logger,
  serverDataList: ServerDataList,
  modules: Array<PurchaserModule>,
) {
  return config.disablePurchasing
    ? [new Purchaser(ns, logger, [new PlayerServerPurchaser(ns, logger, serverDataList)])]
    : [new Purchaser(ns, logger, modules)];
}
