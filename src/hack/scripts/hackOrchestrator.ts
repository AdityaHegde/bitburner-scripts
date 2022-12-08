import { NS } from "../../types/gameTypes";
import {
  getHackMetadata,
  HackMetadata,
  newHackMetadata,
  saveHackMetadata,
} from "../helpers/hacksMetadata";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { Logger } from "../../utils/logger";
import { runHackScriptOnServer } from "../helpers/runHackScript";
import { getHackTargets } from "../helpers/getHackTargets";
import { nukeServers } from "../helpers/cracks";

const logger = new Logger("DistributedHack");

export async function main(ns: NS) {
  const hackMetadata: HackMetadata = getHackMetadata(ns) ?? newHackMetadata();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await logger.started(ns);

    const metadata: Metadata = getMetadata(ns);
    if (!metadata) {
      await ns.sleep(1000);
      continue;
    }
    // nuke any new servers and existing servers that can now be nuked
    nukeServers(ns, metadata, hackMetadata);
    // save the stats
    saveMetadata(ns, metadata);
    saveHackMetadata(ns, hackMetadata);

    // get hack targets
    const hackTargets = getHackTargets(ns, logger, metadata, hackMetadata);

    const newTargetServerStats: Record<
      string,
      Record<string, Record<number, number>>
    > = {};

    // run the hack targets
    for (const { target, type, servers } of hackTargets) {
      for (const [server, threads] of servers) {
        newTargetServerStats[server] ??= {};
        newTargetServerStats[server][target] ??= {};

        if (
          hackMetadata.serverStats[server].targetServer[target]?.[type] ===
          threads
        ) {
          // if there is no change in target, type and threads
          newTargetServerStats[server][target][type] =
            hackMetadata.serverStats[server].targetServer[target][type];
          continue;
        }

        // run the script
        runHackScriptOnServer(ns, type, server, target, threads);
        // update hack metadata
        newTargetServerStats[server][target][type] = threads;
        await ns.sleep(100);
      }
    }

    for (const server in hackMetadata.serverStats) {
      hackMetadata.serverStats[server].targetServer =
        newTargetServerStats[server] ?? {};
    }

    saveHackMetadata(ns, hackMetadata);
    logger.ended(ns);
    await ns.sleep(5000);
  }
}
