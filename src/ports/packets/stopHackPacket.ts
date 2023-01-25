import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type StopHackPacket = PortPacket<
  PortPacketType.StopHack,
  {
    server: string;
  }
>;

export function newStopHackPacket(server: string): StopHackPacket {
  return {
    type: PortPacketType.StopHack,
    server,
  };
}
