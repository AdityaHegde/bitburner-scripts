import { NS } from "../../types/gameTypes";
import { HackState, HackStateToScript } from "../../types/Hack";
import { getMetadata, Metadata } from "../../types/Metadata";
import { getBestTargetServer } from "../../utils/getBestTargetServer";
import { Logger } from "../../utils/logger";
import { runActionScriptOnServer } from "../../utils/runActionScriptOnServer";

const logger = new Logger("DistributedHack");

export async function main(ns: NS) {
  await logger.started(ns);

  let state: HackState;
  while (true) {
    const metadata: Metadata = await getMetadata(ns);
    if (!metadata) {
      await ns.sleep(1000);
      continue;
    }

    const targetServer = getBestTargetServer(ns, metadata.servers, ns.getHackingLevel());

    const moneyThreshold = ns.getServerMaxMoney(targetServer) * 0.75;
    const securityThreshold = ns.getServerMinSecurityLevel(targetServer) + 5;

    let newState: HackState;
    if (ns.getServerSecurityLevel(targetServer) > securityThreshold) {
      newState = HackState.Weaken;
    } else if (ns.getServerMoneyAvailable(targetServer) < moneyThreshold) {
      newState = HackState.Grow
    } else {
      newState = HackState.Hack;
    }

    if (state !== newState) {
      state = newState;
      const newScript = HackStateToScript[state];
      await logger.log(ns, `Running script=${newScript} targetServer=${targetServer}`);
      metadata.servers.forEach(server =>
        runActionScriptOnServer(ns, newScript, server, targetServer));
      metadata.playerServers.forEach(server =>
        runActionScriptOnServer(ns, newScript, server, targetServer));
    }

    await ns.sleep(5000);
  }
}
