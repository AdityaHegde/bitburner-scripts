import { MetadataFile } from "../../constants";
import { NS } from "../../types/gameTypes";
import { Metadata, metadataFactory, saveMetadata } from "../../types/Metadata";
import { Logger } from "../../utils/logger";

const logger = new Logger("InitMetadata");

export async function main(ns: NS) {
  await logger.started(ns);
  let metadata: Metadata;
  if (!ns.fileExists(MetadataFile)) {
    metadata = metadataFactory(ns);
  }

  await saveMetadata(ns, metadata);
  await logger.ended(ns);
}
