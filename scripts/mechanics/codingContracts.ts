import type { NS } from "$src/types/gameTypes";
import { CodingContractSolver } from "$src/coding-contracts/codingContractSolver";
import { Logger } from "$src/utils/logger/logger";
import { PortWrapper, ServerActionResponsePort } from "$src/ports/portWrapper";
import { newScriptStoppedPacket } from "$src/ports/packets/scriptStopped";
import { CodingContractSolverScript } from "$src/coding-contracts/codingContractScanner";

export async function main(ns: NS) {
  const solver = new CodingContractSolver(ns, Logger.ConsoleLogger(ns, "CodingContract"));
  await solver.solveContracts(JSON.parse(ns.args[0] as string));
  const responsePort = new PortWrapper(ns, ServerActionResponsePort);
  await responsePort.write(newScriptStoppedPacket(CodingContractSolverScript));
}
