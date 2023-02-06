import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";

export class StockMarket {
  public constructor(private readonly ns: NS, private readonly logger: Logger) {}

  public run() {
    const symbols = this.ns.stock.getSymbols();
    for (const symbol of symbols) {
      this.logger.log("Symbol", {
        symbol,
        price: this.ns.stock.getPrice(symbol),
        volatility: this.ns.stock.getVolatility(symbol),
        forecast: this.ns.stock.getForecast(symbol),
        organization: this.ns.stock.getOrganization(symbol),
      });
    }
  }
}
