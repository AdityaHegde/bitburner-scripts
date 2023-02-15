import { EventEmitter } from "$src/utils/eventEmitter";

export type PurchaserModuleEvents = {
  purchaserTrigger: (name: string) => void;
};

export abstract class PurchaserModule extends EventEmitter<PurchaserModuleEvents> {
  public name: string;
  public price: number;
  public score: number;
  public enabled = true;

  public abstract init(): void;

  public abstract update(): boolean;

  public abstract purchase(): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public trigger(name: string): boolean {
    return true;
  }
}
