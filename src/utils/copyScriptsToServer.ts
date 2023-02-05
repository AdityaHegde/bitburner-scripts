import { WriteRemoteMetadataScript } from "../constants";
import type { NS } from "../types/gameTypes";
import { ServerActionScripts } from "$src/servers/server-actions/serverActionType";
import { CodingContractSolverScript } from "$src/coding-contracts/codingContractScanner";
import { CodingContractWorkerScript } from "$src/coding-contracts/codingContractSolver";

export function copyScriptToServer(ns: NS, server: string): void {
  ns.scp(
    [
      ...ServerActionScripts,
      WriteRemoteMetadataScript,
      CodingContractSolverScript,
      CodingContractWorkerScript,
    ],
    server,
  );
}
