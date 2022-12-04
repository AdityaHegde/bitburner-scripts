import { NukeHostsScript, PurchaseServersScript } from "../../constants";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { Logger } from "../../utils/logger";

const logger = new Logger("Orchestrator");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);

  const curHackingLevel = ns.getHackingLevel();

  let forwarded = false;

  while (!forwarded) {
    if (
      curHackingLevel > metadata.lastCheckHackLevel &&
      metadata.newServers.length > 0
    ) {
      // run nukeHosts if hacking level changed or new servers were added.
      // TODO: make sure the hacking level can crack new host
      await logger.log(ns, `Ran ${NukeHostsScript}`);
      ns.run(NukeHostsScript, 1);
      forwarded = true;
    } else if (
      metadata.playerServerCount < metadata.playerServerMaxCount &&
      ns.getServerMoneyAvailable("home") >
        ns.getPurchasedServerCost(metadata.playerServerSize)
    ) {
      // run purchase server if possible
      await logger.log(ns, `Ran ${PurchaseServersScript}`);
      ns.run(PurchaseServersScript, 1);
      forwarded = true;
    }

    metadata.lastCheckHackLevel = curHackingLevel;
    await saveMetadata(ns, metadata);
  }

  await logger.ended(ns);
}
