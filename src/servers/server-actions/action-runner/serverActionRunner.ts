import type { NetscriptPort, NS } from "$src/types/gameTypes";
import { ServerActionPorts } from "$src/servers/server-actions/serverActionPorts";
import type { Logger } from "$src/utils/logger/logger";
import type { ServerActionType } from "$src/servers/server-actions/serverActionType";
import type { ServerActionReferenceData } from "$src/ports/packets/serverActionReferenceData";
import { ServerActionResponsePort } from "$src/ports/portWrapper";
import { newExitedPacket } from "$src/ports/packets/exitedPacket";
import { newBatchStartedPacket } from "$src/ports/packets/batchStartedPacket";

export class ServerActionRunner {
  protected readonly responsePort: NetscriptPort;
  protected readonly serverActionPorts: ServerActionPorts;
  protected readonly isLeader: boolean;

  constructor(
    protected readonly ns: NS,
    protected readonly logger: Logger,
    protected readonly serverAction: ServerActionType,
    protected readonly action: (server: string, stock: number) => Promise<number>,
    protected readonly reference: ServerActionReferenceData,
    // unique per batch
    protected readonly commandPort: number,
    // unique per batch
    syncPort: number,
    // unique per batch
    triggerPort: number,
  ) {
    this.responsePort = ns.getPortHandle(ServerActionResponsePort);
    this.serverActionPorts = new ServerActionPorts(ns, commandPort, syncPort, triggerPort);
    this.isLeader = reference.processIndex === 0;
  }

  public static fromNS(
    ns: NS,
    serverAction: ServerActionType,
    action: (server: string, stock: number) => Promise<number>,
  ) {
    const reference = JSON.parse(ns.args[0] as string);
    return new ServerActionRunner(
      ns,
      undefined,
      serverAction,
      action,
      reference,
      Number(ns.args[1] as number),
      Number(ns.args[2] as number),
      Number(ns.args[3] as number),
    );
  }

  public async start() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [, , count] = this.serverActionPorts.getActionInfo();
      if (count === 0) break;

      if (this.reference.processIndex === 0) {
        await this.responsePort.write(
          JSON.stringify(newBatchStartedPacket(this.commandPort, 0, 0)),
        );
      }

      const [server, stock] = this.serverActionPorts.getTargetInfo();
      await this.ns.sleep(5);
      await this.action(server, stock);
    }

    this.ns.atExit(() =>
      this.responsePort.write(JSON.stringify(newExitedPacket(this.commandPort, this.reference))),
    );
  }
}
