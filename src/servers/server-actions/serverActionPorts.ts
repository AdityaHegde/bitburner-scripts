import type { NetscriptPort, NS } from "$src/types/gameTypes";

export class ServerActionPorts {
  private readonly commandPortHandle: NetscriptPort;
  private readonly syncPortHandle: NetscriptPort;
  private readonly triggerPortHandle: NetscriptPort;

  constructor(
    private readonly ns: NS,
    public readonly commandPort: number,
    public readonly syncPort: number,
    public readonly triggerPort: number,
  ) {
    this.commandPortHandle = ns.getPortHandle(commandPort);
    this.syncPortHandle = ns.getPortHandle(syncPort);
    this.triggerPortHandle = ns.getPortHandle(triggerPort);
  }

  public getTargetInfo(): [server: string, stock: number, hackTime: number, notPrepped: number] {
    if (this.commandPortHandle.empty()) return ["", 0, 0, 0];

    const data = (this.commandPortHandle.peek() as string).split("__");
    return [data[0], Number(data[1]), Number(data[2]), Number(data[3])];
  }

  public setTargetInfo(server: string, stock: number, hackTime: number, notPrepped: number) {
    if (!this.commandPortHandle.empty()) this.commandPortHandle.read();
    this.commandPortHandle.write(`${server}__${stock}__${hackTime}__${notPrepped}`);
  }

  public getActionInfo(): [starts: number, ends: number, count: number, endTime: number] {
    if (this.syncPortHandle.empty()) return [0, 0, 0, 0];

    const data = (this.syncPortHandle.peek() as string).split("__");
    return [Number(data[0]), Number(data[1]), Number(data[2]), Number(data[3])];
  }

  public setActionInfo(starts: number, ends: number, count: number, endTime: number) {
    if (!this.syncPortHandle.empty()) this.syncPortHandle.read();
    this.syncPortHandle.write(`${starts}__${ends}__${count}__${endTime}`);
  }

  public async waitForTrigger() {
    return this.triggerPortHandle.nextWrite();
  }

  public trigger() {
    if (!this.triggerPortHandle.empty()) this.triggerPortHandle.read();
    this.triggerPortHandle.write(1);
  }
}
