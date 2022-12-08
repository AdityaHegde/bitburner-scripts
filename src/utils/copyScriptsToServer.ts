import {
  HackOrchestratorScript,
  WriteRemoteMetadataScript,
} from "../constants";
import { NS } from "../types/gameTypes";
import { HackScripts } from "../hack/helpers/hackTypes";

export function copyScriptToServer(ns: NS, server: string): void {
  ns.scp(
    [...HackScripts, HackOrchestratorScript, WriteRemoteMetadataScript],
    server
  );
}
