import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type ServerStartedPacket = PortPacket<
  PortPacketType.ServerStarted,
  {
    port: number;
  }
>;

export function newServerStartedPacket(port: number): ServerStartedPacket {
  return {
    type: PortPacketType.ServerStarted,
    port,
  };
}
