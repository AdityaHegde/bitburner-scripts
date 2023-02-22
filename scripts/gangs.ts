import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger/logger";
import { GangManager } from "$src/gang/GangManager";
import { Second } from "$src/constants";

export async function main(ns: NS) {
  const logger = Logger.ConsoleLogger(ns, "Gang");

  while (!ns.gang.inGang()) {
    await ns.sleep(Second);
  }

  const gangManager = new GangManager(ns, logger);
  await gangManager.init();
  return gangManager.process();
}
