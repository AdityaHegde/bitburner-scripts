import { DistributedHackScript, NukeHostsScript, PurchaseServersScript } from "../../constants";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { Logger } from "../../utils/logger";

const logger = new Logger("Orchestrator");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);

  const curHackingLevel = ns.getHackingLevel();

  if (curHackingLevel > metadata.lastCheckHackLevel &&
      metadata.newServers.length > 0) {
    await logger.log(ns, `Ran ${NukeHostsScript}`);
    ns.run(NukeHostsScript, 1);

  } else if (metadata.playerServerCount < metadata.playerServerMaxCount &&
             ns.getServerMoneyAvailable("home") >
               ns.getPurchasedServerCost(metadata.playerServerSize)) {
    await logger.log(ns, `Ran ${PurchaseServersScript}`);
    ns.run(PurchaseServersScript, 1);
    
  } else {
    await logger.log(ns, `Ran ${DistributedHackScript}`);
    ns.run(DistributedHackScript, 1);
  }

  metadata.lastCheckHackLevel = curHackingLevel;
  await saveMetadata(ns, metadata);
  await logger.ended(ns);
}
