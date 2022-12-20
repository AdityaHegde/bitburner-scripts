import type { NS } from "$scripts/types/gameTypes";
import { HackType } from "$scripts/hack/helpers/hackTypes";
import { MetadataFile, WriteRemoteMetadataScript } from "$scripts/constants";

export const BatchMetadataFile = "batch.txt";

export enum BatchHackType {
  Grow,
  GrowWeaken,
  Hack,
  HackWeaken,
}
export const BatchHackTypeMap: {
  [type in BatchHackType]: HackType;
} = {
  [BatchHackType.Grow]: HackType.Grow,
  [BatchHackType.GrowWeaken]: HackType.Weaken,
  [BatchHackType.Hack]: HackType.Hack,
  [BatchHackType.HackWeaken]: HackType.Weaken,
};
export const BatchHackTypeReverseMap: {
  [type in HackType]: BatchHackType;
} = {
  [HackType.Grow]: BatchHackType.Grow,
  [HackType.Weaken]: BatchHackType.HackWeaken,
  [HackType.Hack]: BatchHackType.Hack,
};
export const BatchHackTypeToPort: {
  [type in BatchHackType]: { read: number; write: number };
} = {
  [BatchHackType.Grow]: { read: 10, write: 11 },
  [BatchHackType.GrowWeaken]: { read: 12, write: 13 },
  [BatchHackType.Hack]: { read: 14, write: 15 },
  [BatchHackType.HackWeaken]: { read: 16, write: 17 },
};

export type BatchHackTarget = {
  server: string;
  timings: [number, number, number];
  operations: Array<BatchHackType>;
};

export type BatchMetadata = {
  target: BatchHackTarget;
};

export function readBatchMetadata(ns: NS): BatchMetadata {
  const meta = ns.read(BatchMetadataFile);
  return JSON.parse(meta);
}

export function writeRemoteBatchMetadata(ns: NS, server: string, batchMetadata: BatchMetadata) {
  return ns.exec(
    WriteRemoteMetadataScript,
    server,
    1,
    BatchMetadataFile,
    JSON.stringify(batchMetadata),
  );
}
