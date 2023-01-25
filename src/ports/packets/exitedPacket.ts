import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type ExitedPacket = PortPacket<
  PortPacketType.Exited,
  {
    port: number;
  }
>;

export function newExitedPacket(port: number): ExitedPacket {
  return {
    type: PortPacketType.Exited,
    port,
  };
}
