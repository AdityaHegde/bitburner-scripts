import type { HackActionDataPacket } from "$src/ports/packets/hackActionDataPacket";
import { PortWrapper } from "$src/ports/portWrapper";
import type { ServerAction } from "$src/servers/server-actions/serverAction";
import type { NetscriptPort, NS } from "$src/types/gameTypes";

/**
 * Runs on the servers and does the actual action
 */
export class ServerActionRunner {
  protected readonly commPortWrapper: PortWrapper;
  protected readonly syncPortHandle: NetscriptPort;

  protected actionData: HackActionDataPacket;

  constructor(
    protected readonly ns: NS,
    protected readonly serverAction: ServerAction,
    protected readonly action: (actionData: HackActionDataPacket) => Promise<number>,
    commPort: number,
    syncPort: number,
  ) {
    this.commPortWrapper = new PortWrapper(ns, commPort);
    this.syncPortHandle = ns.getPortHandle(syncPort);
  }

  public async start() {
    this.actionData = await this.commPortWrapper.read<HackActionDataPacket>();
  }

  private async runAction() {}

  private getActionInfo(): [hackTime: number, endTime: number, ends: number] {
    const hackTime = this.syncPortHandle.read() as number;
    const endTime = this.syncPortHandle.read() as number;
    const ends = this.syncPortHandle.read() as number;

    this.syncPortHandle.write(hackTime);
    this.syncPortHandle.write(endTime);
    this.syncPortHandle.write(ends);

    return [hackTime, endTime, ends];
  }
}
