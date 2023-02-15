import type { CityName, NS, Product } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";

enum SellMode {
  Init,
  Expanding,
  Narrowing,
  Maintaining,
}

const PriceMultiNarrowingDiff = 0.5;
const PriceMultiMaintainingStep = 2;
const ProductOverProduceThreshold = 3;
const ProductUnderProduceThreshold = 5;

export class ProductManager {
  public product: Product;

  private sellMode = SellMode.Init;
  private sellLow = 1;
  private sellMulti = 1;
  private sellHigh = 2;

  private overproduceCount = 0;
  private underProduceCount = 0;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly divisionName: string,
    private readonly cityName: CityName,
    public readonly productName: string,
  ) {
    this.product = ns.corporation.getProduct(divisionName, productName);
  }

  public init() {
    const currentPrice = this.ns.corporation.getProduct(this.divisionName, this.productName);
    if (!currentPrice.sCost) return;

    this.sellMulti =
      typeof currentPrice.sCost === "string"
        ? parseInt(currentPrice.sCost.replace("MP*", ""))
        : currentPrice.sCost;
    this.logger.log("ProductFound", {
      productName: this.productName,
      sellMulti: this.sellMulti,
    });
    this.sellMode = SellMode.Expanding;
  }

  public process() {
    this.product = this.ns.corporation.getProduct(this.divisionName, this.productName);
    if (!this.hasCompleted()) return;

    this.adjustSellPrice();
  }

  public hasCompleted() {
    return this.product.developmentProgress === 100;
  }

  private adjustSellPrice() {
    const warehouse = this.ns.corporation.getWarehouse(this.divisionName, this.cityName);
    const almostFull = warehouse.sizeUsed === warehouse.size;
    const [quantity, produced, sold] = this.product.cityData[this.cityName];

    switch (this.sellMode) {
      case SellMode.Init:
        this.setSellPrice();
        this.sellMode = SellMode.Expanding;
        break;

      case SellMode.Expanding:
        if (produced <= sold) {
          if (almostFull || quantity > 0) break;
          this.sellLow = this.sellMulti;
          this.sellMulti *= 2;
          this.setSellPrice();
        } else {
          this.sellHigh = this.sellMulti;
          this.sellMulti = (this.sellLow + this.sellHigh) / 2;
          this.sellMode = SellMode.Narrowing;
          this.logger.log("SettledOnPrice", {
            productName: this.productName,
            price: `MP*${this.sellMulti}`,
          });
          this.setSellPrice();
        }
        break;

      case SellMode.Narrowing:
        if (produced <= sold) {
          if (almostFull || quantity > 0) break;
          this.sellLow = this.sellMulti;
          this.sellMulti = (this.sellLow + this.sellHigh) / 2;
        } else {
          this.sellHigh = this.sellMulti;
          this.sellMulti = (this.sellLow + this.sellHigh) / 2;
        }
        if (this.sellHigh - this.sellLow < PriceMultiNarrowingDiff) {
          this.sellMulti -= PriceMultiMaintainingStep;
          this.sellMode = SellMode.Maintaining;
        }
        this.setSellPrice();
        break;

      case SellMode.Maintaining:
        if (produced <= sold) {
          if (almostFull || quantity > 0) break;
          this.overproduceCount = 0;
          this.underProduceCount++;
          if (this.underProduceCount < ProductUnderProduceThreshold) break;

          this.sellMulti += PriceMultiMaintainingStep;
          this.setSellPrice();
          this.underProduceCount = 0;
        } else if (produced > sold) {
          this.underProduceCount = 0;
          this.overproduceCount++;
          if (this.overproduceCount < ProductOverProduceThreshold) break;

          this.sellMulti -= PriceMultiMaintainingStep;
          this.setSellPrice();
          this.overproduceCount = 0;
        }
        break;
    }
  }

  private setSellPrice() {
    this.ns.corporation.sellProduct(
      this.divisionName,
      this.cityName,
      this.productName,
      "MAX",
      `MP*${this.sellMulti}`,
      true,
    );
  }
}
