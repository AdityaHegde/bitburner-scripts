import { WriteRemoteMetadataScript } from "../constants";
import type { NS } from "../types/gameTypes";
import { ServerActionScripts } from "$src/servers/server-actions/serverActionType";

export function copyScriptToServer(ns: NS, server: string): void {
  ns.scp([...ServerActionScripts, WriteRemoteMetadataScript], server);
}
