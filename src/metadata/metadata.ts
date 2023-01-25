import { MetadataFile, WriteRemoteMetadataScript } from "../constants";
import type { NS } from "../types/gameTypes";

export type Metadata = {
  newServers: Array<string>;
  runnerServer?: string;
};

export function newMetadata(ns: NS): Metadata {
  return {
    newServers: ["home", ...ns.getPurchasedServers()],
  };
}

export function getMetadata(ns: NS): Metadata {
  const metadataString = ns.read(MetadataFile);
  return metadataString ? JSON.parse(metadataString) : undefined;
}

export function saveMetadata(ns: NS, metadata: Metadata) {
  ns.write(MetadataFile, JSON.stringify(metadata), "w");
}

export function saveMetadataOnServer(ns: NS, metadata: Metadata, server: string) {
  return ns.exec(WriteRemoteMetadataScript, server, 1, MetadataFile, JSON.stringify(metadata));
}
