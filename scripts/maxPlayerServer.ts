import type { NS } from "$src/types/gameTypes";
import { getMaxPlayerServerOrchestrator } from "$src/runner/orchestratorFactories";
import { config } from "$src/config";

export async function main(ns: NS) {
  const orchestrator = getMaxPlayerServerOrchestrator(ns, ns.getScriptRam("maxPlayerServer.js"));
  config.backFillExp = false;
  config.backFillPower = false;
  orchestrator.init();
  await orchestrator.start();
}
