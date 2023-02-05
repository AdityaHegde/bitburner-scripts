import type { PortPacket, PortPacketType } from "$src/ports/packets/portPacket";
import type { NetscriptPort, NS } from "../types/gameTypes";

export const PortDataWait = 50;

export const LogAggregationPort = 99;

export const ServerActionResponsePort = 100;
export const HackPortStart = 101;

export class PortWrapper {
  private readonly portHandle: NetscriptPort;

  public constructor(private readonly ns: NS, public readonly port: number) {
    this.portHandle = ns.getPortHandle(port);
  }

  public async write<Packet extends PortPacket<PortPacketType, any>>(packet: Packet) {
    while (this.portHandle.full()) {
      await this.ns.sleep(PortDataWait);
    }

    this.portHandle.write(JSON.stringify(packet));
  }

  public async read<Packet extends PortPacket<PortPacketType, any>>(
    failOnNoData = false,
  ): Promise<Packet> {
    if (this.portHandle.empty()) {
      if (failOnNoData) {
        return undefined;
      }
      await this.portHandle.nextWrite();
    }

    const packet = this.portHandle.read() as string;
    return JSON.parse(packet) as Packet;
  }

  public empty() {
    return this.portHandle.empty();
  }

  public peek() {
    return this.portHandle.peek();
  }

  public clear() {
    this.portHandle.clear();
  }
}
