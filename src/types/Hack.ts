import { NS } from "./gameTypes";

export enum HackState {
  Grow,
  Weaken,
  Hack,
}

export const GrowScript = "grow.js";
export const WeakenScript = "weaken.js";
export const HackScript = "hack.js";
export const HackScripts = [GrowScript, WeakenScript, HackScript];

export const HackStateToScript: {
  [state in HackState]: string
} = {
  [HackState.Grow]: GrowScript,
  [HackState.Weaken]: WeakenScript,
  [HackState.Hack]: HackScript,
};

export interface HackMetadata {
  state?: HackState;
  targetServer?: string;
  runningServers?: Array<string>;
}

export const HackMetadataFile = "hack.txt";

export async function getHackMetadata(ns: NS): Promise<HackMetadata> {
  const metadataString = await ns.read(HackMetadataFile);
  return metadataString ? JSON.parse(metadataString) : undefined;
}

export async function saveHackMetadata(ns: NS, hackMetadata: HackMetadata) {
  await ns.write(HackMetadataFile, JSON.stringify(hackMetadata), "w");
}
