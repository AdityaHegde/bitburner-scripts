import { PurchaserModule } from "$src/purchaser/PurchaserModule";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import type { TORAutomation } from "$src/automation/TORAutomation";
import { config } from "$src/config";
import { FormulaName, FormulaPrice } from "$src/servers/cracks";
import { FormulaPurchaserName } from "$src/purchaser/Purchaser";

export class FormulaPurchaser extends PurchaserModule {
  public name = FormulaPurchaserName;
  private boughtFormula = false;

  public constructor(private ns: NS, private logger: Logger, private torAutomation: TORAutomation) {
    super();
  }

  public init(): void {
    this.boughtFormula = config.hasFormulaAccess;
  }

  public update(): boolean {
    if (this.boughtFormula) return false;
    this.score = 0;
    this.price = FormulaPrice;
    return true;
  }

  public async purchase(): Promise<void> {
    await this.torAutomation.buyCrack(FormulaName);
    if (!this.ns.fileExists(FormulaName, "home")) {
      this.logger.error("PurchasedFormulaFailed");
      return;
    }

    this.boughtFormula = true;
    config.hasFormulaAccess = true;
    this.logger.info("PurchasedFormula");
    this.emit("purchaserTrigger", this.name);
  }
}
