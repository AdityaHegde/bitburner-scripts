import type { ReferenceHackData } from "$src/ports/packets/hackRequestPacket";
import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type HackResponsePacket = PortPacket<
  PortPacketType.HackResponse,
  {
    port: number;
    target: string;
    reference: ReferenceHackData;
  }
>;

export function newHackResponsePacket(
  port: number,
  target: string,
  reference: ReferenceHackData,
): HackResponsePacket {
  return {
    type: PortPacketType.HackResponse,
    port,
    target,
    reference,
  };
}
