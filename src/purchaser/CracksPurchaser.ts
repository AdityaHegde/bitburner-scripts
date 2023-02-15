import type { NS } from "$src/types/gameTypes";
import type { Cracks } from "$src/servers/cracks";
import { CostOfCracks, CostOfTOR, ListOfCracks } from "$src/servers/cracks";
import type { TORAutomation } from "$src/automation/TORAutomation";
import { PurchaserModule } from "$src/purchaser/PurchaserModule";
import type { ServerDataList } from "$src/servers/serverDataList";
import type { Logger } from "$src/utils/logger/logger";
import { CracksPurchaserName, PlayerServerPurchaserName } from "$src/purchaser/Purchaser";

export class CracksPurchaser extends PurchaserModule {
  public name = CracksPurchaserName;
  private readonly cracks: Cracks;
  private triggered = false;

  public constructor(
    private ns: NS,
    private logger: Logger,
    private serverDataList: ServerDataList,
    private torAutomation: TORAutomation,
  ) {
    super();
    this.cracks = serverDataList.cracks;
  }

  public init(): void {
    this.enabled = this.triggered;
    this.cracks.collectCracks();
    this.logger.info("CrackPurchaser", {
      hasTor: this.ns.hasTorRouter(),
      nextCrack: ListOfCracks[this.cracks.cracks.length],
    });
  }

  public update(): boolean {
    const crackIdx = this.cracks.cracks.length;
    if (crackIdx === ListOfCracks.length) return false;
    this.price = CostOfCracks[crackIdx] + (this.ns.hasTorRouter() ? 0 : CostOfTOR);
    const memForNewCrack = this.serverDataList.serversByPorts[crackIdx].reduce(
      (mem, serverData) => mem + serverData.maxMem,
      0,
    );
    this.score = memForNewCrack / this.price;
    return true;
  }

  public async purchase(): Promise<void> {
    if (!this.ns.hasTorRouter()) await this.torAutomation.buyTorServer();
    await this.torAutomation.buyCrack(ListOfCracks[this.cracks.cracks.length]);
    const curCracks = this.cracks.cracks.length;
    this.cracks.collectCracks();
    if (curCracks === this.cracks.cracks.length) {
      this.logger.error("PurchasedCrackFailed", {
        crack: ListOfCracks[curCracks],
      });
    } else {
      this.logger.info("PurchasedCrack", {
        crack: ListOfCracks[curCracks],
      });
    }
  }

  public trigger(name: string): boolean {
    if (name !== PlayerServerPurchaserName) return false;
    this.triggered = true;
    return true;
  }
}
