import { WriteRemoteMetadataScript } from "../constants";
import { HackScripts } from "../servers/hack/hackTypes";
import type { NS } from "../types/gameTypes";

export function copyScriptToServer(ns: NS, server: string): void {
  ns.scp([...HackScripts, WriteRemoteMetadataScript], server);
}
