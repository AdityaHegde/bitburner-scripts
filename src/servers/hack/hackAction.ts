import type { HackActionDataPacket } from "$src/ports/packets/hackActionDataPacket";
import { PortWrapper } from "$src/ports/portWrapper";
import type { HackType } from "$src/servers/hack/hackTypes";
import type { NS } from "$src/types/gameTypes";

export class HackAction {
  protected readonly commPortWrapper: PortWrapper;
  protected readonly syncPortWrapper: PortWrapper;

  protected actionData: HackActionDataPacket;

  constructor(
    protected readonly ns: NS,
    protected readonly hackType: HackType,
    protected readonly action: (actionData: HackActionDataPacket) => Promise<number>,
    commPort: number,
    syncPort: number,
  ) {
    this.commPortWrapper = new PortWrapper(ns, commPort);
    this.syncPortWrapper = new PortWrapper(ns, syncPort);
  }

  public async start() {
    this.actionData = await this.commPortWrapper.read<HackActionDataPacket>();
  }
}
