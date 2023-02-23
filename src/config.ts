import type { NS } from "$src/types/gameTypes";
import { FormulaName } from "$src/servers/cracks";

export const config = {
  hasFormulaAccess: false,
  backFillExp: true,
  backFillPower: false,
  prepOnly: false,

  disablePurchasing: false,
  playerServerInitMem: 8,
  playerServerMaxMem: Number.MAX_SAFE_INTEGER,

  corp: false,
  gang: false,
  sleeves: false,
};

export function initConfig(ns: NS) {
  config.hasFormulaAccess = ns.fileExists(FormulaName, "home");
}
