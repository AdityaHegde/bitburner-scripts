import { DistributedHackScript, NukeHostScript, PurchaseServerScript } from "../../constants";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { hasOrchestrationActions, OrchestrationActions, unsetOrchestrationActions } from "../../types/Orchestration";
import { Logger } from "../../utils/logger";

const logger = new Logger("Orchestrator");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);

  const curHackingLevel = ns.getHackingLevel();

  if (curHackingLevel > metadata.lastCheckHackLevel &&
      metadata.newServers.length > 0) {
    await logger.log(ns, `Ran ${NukeHostScript}`);
    ns.run(NukeHostScript, 1);

  } else if (hasOrchestrationActions(metadata, OrchestrationActions.NewNPCServer) ||
             hasOrchestrationActions(metadata, OrchestrationActions.NewPurchasedServer) ||
             !metadata.currentHackTarget) {
    unsetOrchestrationActions(metadata, OrchestrationActions.NewNPCServer);
    unsetOrchestrationActions(metadata, OrchestrationActions.NewPurchasedServer);

  } else if (hasOrchestrationActions(metadata, OrchestrationActions.NewTargetAquired)) {
    unsetOrchestrationActions(metadata, OrchestrationActions.NewTargetAquired);
    await logger.log(ns, `Ran ${DistributedHackScript}`);
    ns.run(DistributedHackScript, 1);

  } else if (ns.getServerMoneyAvailable("home") >
             ns.getPurchasedServerCost(metadata.playerServerSize)) {
    await logger.log(ns, `Ran ${PurchaseServerScript}`);
    ns.run(PurchaseServerScript, 1);
    
  } else {
    await logger.log(ns, `Ran ${DistributedHackScript}`);
    ns.run(DistributedHackScript, 1);
  }

  metadata.lastCheckHackLevel = curHackingLevel;
  await saveMetadata(ns, metadata);
  await logger.ended(ns);
}
