import type { NS } from "$src/types/gameTypes";
import type { Orchestrator } from "$src/runner/orchestrator";
import {
  getGenericMidGameOrchestrator,
  getMaxPlayerServerOrchestrator,
  getPrepOnlyOrchestrator,
} from "$src/runner/orchestratorFactories";
import { config } from "$src/config";
import { validateFlags } from "$src/utils/validateFlags";

export enum MidGameMode {
  Default = "Default",
  Servers = "Servers",
  Prep = "Prep",
}

export enum MidGameBackFill {
  None = "None",
  Exp = "Exp",
  Power = "Power",
}

export type MidGameFlags = {
  mode: MidGameMode;
  backfill: MidGameBackFill;
  noPurchase: boolean;
  corp: boolean;
};

export async function main(ns: NS) {
  const [ok, flags] = validateFlags<MidGameFlags>(ns, [
    ["string", "mode", "Mode of the script.", MidGameMode.Default, Object.keys(MidGameMode)],
    ["string", "backfill", "Back fill type", MidGameBackFill.Exp, Object.keys(MidGameBackFill)],
    ["boolean", "noPurchase", "No purchasing.", false],
    ["boolean", "corp", "Enable corp.", false],
  ]);
  if (!ok) {
    return;
  }

  config.disablePurchasing = flags.noPurchase;
  config.corp = flags.corp;

  const mem = ns.getScriptRam("midGame.js");

  let orchestrator: Orchestrator;
  switch (flags.mode) {
    case MidGameMode.Default:
      orchestrator = getGenericMidGameOrchestrator(ns, mem);
      break;

    case MidGameMode.Servers:
      orchestrator = getMaxPlayerServerOrchestrator(ns, mem);
      break;

    case MidGameMode.Prep:
      orchestrator = getPrepOnlyOrchestrator(ns, mem);
      config.prepOnly = true;
      break;
  }

  switch (flags.backfill) {
    case MidGameBackFill.None:
      config.backFillExp = false;
      config.backFillPower = false;
      break;

    case MidGameBackFill.Exp:
      config.backFillExp = true;
      config.backFillPower = false;
      break;

    case MidGameBackFill.Power:
      config.backFillExp = false;
      config.backFillPower = true;
      break;
  }

  ns.tprintf(
    `Running with mode=%s backFillExp=%s backFillPower=%s`,
    flags.mode,
    config.backFillExp,
    config.backFillPower,
  );

  orchestrator.init();
  await orchestrator.start();
}
