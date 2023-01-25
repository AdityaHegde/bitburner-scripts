import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type HackStoppedPacket = PortPacket<
  PortPacketType.HackStopped,
  {
    port: number;
  }
>;

export function newHackStoppedPacket(port: number): HackStoppedPacket {
  return {
    type: PortPacketType.HackStopped,
    port,
  };
}
