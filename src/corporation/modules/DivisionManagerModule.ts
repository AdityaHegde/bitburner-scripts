import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { EventEmitter } from "$src/utils/eventEmitter";

export type DivisionManagerModuleEvents = {
  researched: (name: string) => void;
};

export abstract class DivisionManagerModule extends EventEmitter<DivisionManagerModuleEvents> {
  public constructor(
    protected readonly ns: NS,
    protected readonly logger: Logger,
    protected readonly divisionName: string,
  ) {
    super();
  }

  public abstract init(): void;

  public abstract process(): void;

  public researched(name: string) {
    // nothing
  }
}
