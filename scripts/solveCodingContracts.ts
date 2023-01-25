import { CodingContracts } from "$src/coding-contracts/codingContracts";
import { getMetadata } from "$src/metadata/metadata";
import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger/logger";

export async function main(ns: NS) {
  const metadata = getMetadata(ns);
  const codingContracts = new CodingContracts(
    ns,
    Logger.ConsoleLogger(ns, "CodingContracts"),
    metadata.newServers,
  );
  codingContracts.run();
}
