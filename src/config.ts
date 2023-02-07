import type { NS } from "$src/types/gameTypes";

export const config = {
  hasFormulaAccess: false,
  backFillExp: true,
  backFillPower: false,
  prepOnly: false,
};

export function initConfig(ns: NS) {
  config.hasFormulaAccess = ns.fileExists("Formulas.exe", "home");
}
