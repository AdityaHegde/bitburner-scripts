import type { NS } from "$src/types/gameTypes";
import { getEarlyGameOrchestrator } from "$src/runner/orchestratorFactories";

export async function main(ns: NS) {
  const orchestrator = getEarlyGameOrchestrator(ns, ns.getScriptRam("earlyGame.js"));
  orchestrator.init();
  await orchestrator.start();
}
