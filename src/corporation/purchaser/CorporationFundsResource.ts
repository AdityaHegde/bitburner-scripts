import { PurchaserResource } from "$src/purchaser/PurchaserResource";
import type { NS } from "$src/types/gameTypes";

export class CorporationFundsResource extends PurchaserResource {
  public constructor(ns: NS, private readonly buffer: number) {
    super(ns);
  }

  public getResource(): number {
    return this.ns.corporation.getCorporation().funds / this.buffer;
  }
}
