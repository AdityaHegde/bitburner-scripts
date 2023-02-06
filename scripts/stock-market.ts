import { StockMarket } from "$src/stock-market/stockMarket";
import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger/logger";

export async function main(ns: NS) {
  const stockMarket = new StockMarket(ns, Logger.ConsoleLogger(ns, "StockMarket"));
  stockMarket.run();
}
