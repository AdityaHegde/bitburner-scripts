import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type ServerActionCompletedPacket = PortPacket<
  PortPacketType.ServerActionCompleted,
  {
    port: number;
  }
>;

export function newServerActionCompleted(port: number): ServerActionCompletedPacket {
  return {
    type: PortPacketType.ServerActionCompleted,
    port,
  };
}
