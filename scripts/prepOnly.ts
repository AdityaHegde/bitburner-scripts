import type { NS } from "$src/types/gameTypes";
import { getPrepOnlyOrchestrator } from "$src/runner/orchestratorFactories";
import { config } from "$src/config";

export async function main(ns: NS) {
  const orchestrator = getPrepOnlyOrchestrator(ns, ns.getScriptRam("prepOnly.js"));
  config.prepOnly = true;
  orchestrator.init();
  await orchestrator.start();
}
