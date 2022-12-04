import { NS } from "../../types/gameTypes";
import {
  getHackMetadata,
  HackMetadata,
  HackState,
  HackStateToScript,
  saveHackMetadata,
} from "../../types/Hack";
import { getMetadata, Metadata } from "../../types/Metadata";
import { getBestTargetServer } from "../../utils/getBestTargetServer";
import { Logger } from "../../utils/logger";
import { runActionScriptOnServer } from "../../utils/runActionScriptOnServer";

const logger = new Logger("DistributedHack");

function getNewState(ns: NS, targetServer: string): HackState {
  const moneyThreshold = ns.getServerMaxMoney(targetServer) * 0.75;
  const securityThreshold = ns.getServerMinSecurityLevel(targetServer) + 5;

  let newState: HackState;
  if (ns.getServerSecurityLevel(targetServer) > securityThreshold) {
    newState = HackState.Weaken;
  } else if (ns.getServerMoneyAvailable(targetServer) < moneyThreshold) {
    newState = HackState.Grow;
  } else {
    newState = HackState.Hack;
  }

  return newState;
}

async function runScriptOnServers(
  ns: NS,
  metadata: Metadata,
  state: HackState,
  targetServer: string
): Promise<Set<string>> {
  const runningServers = new Set<string>();
  const script = HackStateToScript[state];
  await logger.log(ns, `Running script=${script} targetServer=${targetServer}`);
  metadata.servers.forEach((server) => {
    runActionScriptOnServer(ns, script, server, targetServer);
    runningServers.add(server);
  });
  metadata.playerServers.forEach((server) => {
    runActionScriptOnServer(ns, script, server, targetServer);
    runningServers.add(server);
  });
  return runningServers;
}

async function runScriptOnNewServers(
  ns: NS,
  metadata: Metadata,
  state: HackState,
  targetServer: string,
  runningServers: Set<string>
): Promise<void> {
  const script = HackStateToScript[state];
  await logger.log(ns, `Running script=${script} targetServer=${targetServer}`);
  metadata.servers.forEach((server) => {
    if (!runningServers.has(server)) {
      runActionScriptOnServer(ns, script, server, targetServer);
    }
    runningServers.add(server);
  });
  metadata.playerServers.forEach((server) => {
    if (!runningServers.has(server)) {
      runActionScriptOnServer(ns, script, server, targetServer);
    }
    runningServers.add(server);
  });
}

export async function main(ns: NS) {
  await logger.started(ns);

  const hackMetadata: HackMetadata = (await getHackMetadata(ns)) ?? {};

  let runningServers = new Set<string>(hackMetadata.runningServers ?? []);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const metadata: Metadata = await getMetadata(ns);
    if (!metadata) {
      await ns.sleep(1000);
      continue;
    }

    const newTargetServer = getBestTargetServer(
      ns,
      metadata.servers,
      ns.getHackingLevel()
    );
    const newState: HackState = getNewState(ns, newTargetServer);

    if (
      hackMetadata.targetServer !== newTargetServer ||
      hackMetadata.state !== newState
    ) {
      hackMetadata.targetServer = newTargetServer;
      hackMetadata.state = newState;
      runningServers = await runScriptOnServers(
        ns,
        metadata,
        hackMetadata.state,
        hackMetadata.targetServer
      );

      hackMetadata.runningServers = [...runningServers];
      await saveHackMetadata(ns, hackMetadata);
    } else if (
      runningServers.size !==
      metadata.servers.length + metadata.playerServers.length
    ) {
      await runScriptOnNewServers(
        ns,
        metadata,
        hackMetadata.state,
        hackMetadata.targetServer,
        runningServers
      );

      hackMetadata.runningServers = [...runningServers];
      await saveHackMetadata(ns, hackMetadata);
    }

    await ns.sleep(5000);
  }
}
