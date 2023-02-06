import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";
import type { ServerActionReferenceData } from "$src/ports/packets/serverActionReferenceData";

export type ExitedPacket = PortPacket<
  PortPacketType.Exited,
  {
    port: number;
    reference: ServerActionReferenceData;
  }
>;

export function newExitedPacket(port: number, reference: ServerActionReferenceData): ExitedPacket {
  return {
    type: PortPacketType.Exited,
    port,
    reference,
  };
}
