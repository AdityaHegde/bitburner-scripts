import type { NS } from "../../types/gameTypes";
import type { HackMetadata } from "../helpers/hacksMetadata";
import { getHackMetadata, newHackMetadata, saveHackMetadata } from "../helpers/hacksMetadata";
import type { Metadata } from "../../types/Metadata";
import { getMetadata, saveMetadata } from "../../types/Metadata";
import { Logger } from "../../utils/logger";
import { getHackTargets } from "../helpers/getHackTargets";
import { nukeServers } from "../helpers/cracks";
import { reconcileHackScripts } from "$scripts/hack/helpers/runHackScript";

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

    const newTargetServerStats: Record<string, Record<string, Record<number, number>>> = {};
    const serverTargets: Record<string, Record<number, Record<string, number>>> = {};

    // run the hack targets
    for (const { target, type, servers } of hackTargets) {
      for (const [server, threads] of servers) {
        newTargetServerStats[server] ??= {};
        newTargetServerStats[server][target] ??= {};
        newTargetServerStats[server][target][type] = threads;

        serverTargets[server] ??= {};
        serverTargets[server][type] ??= {};
        serverTargets[server][type][target] = threads;
      }
    }

    for (const server in hackMetadata.serverStats) {
      if (serverTargets[server]) {
        reconcileHackScripts(ns, server, serverTargets[server]);
      }
      hackMetadata.serverStats[server].targetServer = newTargetServerStats[server] ?? {};
    }

    saveHackMetadata(ns, hackMetadata);
    logger.ended(ns);
    await ns.sleep(5000);
  }
}
