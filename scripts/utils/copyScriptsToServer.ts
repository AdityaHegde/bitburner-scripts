import { BatchCoordinatorScript, WriteRemoteMetadataScript } from "../constants";
import type { NS } from "../types/gameTypes";
import { HackScripts } from "../hack/helpers/hackTypes";

export function copyScriptToServer(ns: NS, server: string): void {
  ns.scp([...HackScripts, BatchCoordinatorScript, WriteRemoteMetadataScript], server);
}
