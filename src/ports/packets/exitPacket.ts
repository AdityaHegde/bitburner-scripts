import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type ExitPacket = PortPacket<
  PortPacketType.Exit,
  {
    server: string;
  }
>;

export function newExitPacket(server: string): ExitPacket {
  return {
    type: PortPacketType.Exit,
    server,
  };
}
