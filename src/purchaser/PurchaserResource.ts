import type { NS } from "$src/types/gameTypes";

export class PurchaserResource {
  public constructor(protected readonly ns: NS) {}

  public getResource() {
    return this.ns.getServerMoneyAvailable("home");
  }
}
