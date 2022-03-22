import { DistributedHackScript, WriteRemoteMetadataScript } from "../constants";
import { NS } from "../types/gameTypes";
import { HackScripts } from "../types/Hack";

export async function copyScriptToServer(ns: NS, server: string) {
  await ns.scp([
    ...HackScripts,
    DistributedHackScript,
    WriteRemoteMetadataScript,
  ], server);
}
