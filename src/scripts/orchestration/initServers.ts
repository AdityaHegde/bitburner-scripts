import { NS } from "../../types/gameTypes";
import { Metadata, getMetadata, saveMetadata } from "../../types/Metadata";
import { copyScriptToServer } from "../../utils/copyScriptsToServer";
import { Logger } from "../../utils/logger";

const logger = new Logger("InitServer");

/**
 * Does a breadth first search for accessible hosts within the city.
 * Saves the identified servers in {@link Metadata.newServers}
 */
export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);

  const foundServers = new Set();
  foundServers.add(metadata.orchestratorServer);

  let newFoundServersCount: number;
  let newFoundServers = ns.scan();

  do {
    newFoundServersCount = 0;
    const newFoundServersTemp = newFoundServers;
    newFoundServers = [];

    for (const newFoundServer of newFoundServersTemp) {
      if (foundServers.has(newFoundServer)) continue;
      foundServers.add(newFoundServer);
      metadata.newServers.push(newFoundServer);

      newFoundServersCount++;
      newFoundServers.push(...ns.scan(newFoundServer));
      await copyScriptToServer(ns, newFoundServer);

      await logger.log(ns, `Found server=${newFoundServer}`);
    }

    await ns.sleep(100);
  } while (newFoundServersCount > 0);

  await saveMetadata(ns, metadata);
  await logger.ended(ns);
}
