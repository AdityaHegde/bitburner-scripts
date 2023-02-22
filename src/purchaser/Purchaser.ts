import { OrchestratorModule } from "$src/runner/orchestratorModule";
import type { PurchaserModule } from "$src/purchaser/PurchaserModule";
import { Heap } from "$src/utils/heap";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { ShorthandNotationSchema } from "$src/utils/shorthand-notation";
import { PurchaserResource } from "$src/purchaser/PurchaserResource";

export const PlayerServerPurchaserName = "PlayerServer";
export const CracksPurchaserName = "Cracks";
export const FormulaPurchaserName = "Formula";

export class Purchaser extends OrchestratorModule {
  private readonly queue: Heap<PurchaserModule>;

  constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly modules: Array<PurchaserModule>,
    private readonly resource?: PurchaserResource,
  ) {
    super();
    this.queue = new Heap(
      (a, b) => {
        if (a.enabled && b.enabled) return b.price - a.price;
        if (a.enabled) return 1;
        return -1;
      },
      (a) => a.name,
    );
    this.resource ??= new PurchaserResource(ns);
  }

  public init() {
    for (const module of this.modules) {
      module.on("purchaserTrigger", (name) => {
        this.handlePurchaserTrigger(name);
      });
      module.init();
      if (module.update()) this.queue.push(module);
    }
    this.log();
  }

  public async process(): Promise<void> {
    let money = this.resource.getResource();
    let topModule = this.queue.peek();

    while (!this.queue.empty() && money >= topModule.price) {
      await topModule.purchase();
      if (topModule.update()) {
        this.queue.updateItem(topModule);
      } else {
        this.queue.delete(topModule);
      }

      money = this.resource.getResource();
      topModule = this.queue.peek();
    }
  }

  private handlePurchaserTrigger(name: string) {
    for (const module of this.modules) {
      if (module.trigger(name) && !module.enabled) {
        module.enabled = true;
        this.queue.updateItem(module);
      }
    }
  }

  private log() {
    this.logger.info("Purchaser", {
      queue: this.queue
        .getArray()
        .map(
          (purchaserModule) =>
            `${purchaserModule.name}:${
              purchaserModule.score?.toFixed(4) ?? 0
            }-${ShorthandNotationSchema.usd.convert(purchaserModule.price)}`,
        )
        .join(" , "),
    });
  }
}
