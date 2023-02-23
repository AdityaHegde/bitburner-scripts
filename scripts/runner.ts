import type { NS } from "$src/types/gameTypes";
import { getEarlyGameOrchestrator } from "$src/runner/orchestratorFactories";
import { config } from "$src/config";
import { BackFillMode, validateRunnerFlags } from "$src/runner/runnerFlags";

export async function main(ns: NS) {
  const [ok, flags] = validateRunnerFlags(ns);
  if (!ok) return;

  config.disablePurchasing = flags.noPurchase;
  if (flags.corp) {
    config.playerServerInitMem = 1024;
    config.corp = true;
  }
  config.gang = flags.gang;
  config.sleeves = flags.sleeves;
  config.playerServerMaxMem = flags.maxMem;

  switch (flags.backfill) {
    case BackFillMode.None:
      config.backFillExp = false;
      config.backFillPower = false;
      break;

    case BackFillMode.Exp:
      config.backFillExp = true;
      config.backFillPower = false;
      break;

    case BackFillMode.Power:
      config.backFillExp = false;
      config.backFillPower = true;
      break;
  }

  ns.tprintf(
    "Running with corp=%s gang=%s sleeves=%s exp=%s power=%s",
    config.corp,
    config.gang,
    config.sleeves,
    config.backFillExp,
    config.backFillPower,
  );

  const orchestrator = getEarlyGameOrchestrator(ns, ns.getScriptRam("runner.js"));
  orchestrator.init();
  await orchestrator.start();
}
