import type { NS } from "$src/types/gameTypes";
import { getEarlyGameOrchestrator } from "$src/runner/orchestratorFactories";
import { validateFlags } from "$src/utils/validateFlags";
import { config } from "$src/config";

export type EarlyGameFlags = {
  noPurchase: boolean;
  corp: boolean;
};

export async function main(ns: NS) {
  const [ok, flags] = validateFlags<EarlyGameFlags>(ns, [
    ["boolean", "noPurchase", "No purchasing.", false],
    ["boolean", "corp", "Enable corp.", false],
  ]);
  if (!ok) {
    return;
  }

  config.disablePurchasing = flags.noPurchase;
  if (flags.corp) {
    config.playerServerInitMem = 1024;
    config.corp = true;
  }

  const orchestrator = getEarlyGameOrchestrator(ns, ns.getScriptRam("runner.js"));
  orchestrator.init();
  await orchestrator.start();
}
