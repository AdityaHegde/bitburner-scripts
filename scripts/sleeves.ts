import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger/logger";
import { SleevesManager } from "$src/sleeves/SleevesManager";

export async function main(ns: NS) {
  const logger = Logger.ConsoleLogger(ns, "Sleeves");
  const sleevesManager = new SleevesManager(ns, logger);
  sleevesManager.init();
  return sleevesManager.process();
}
