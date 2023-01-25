import type { ReferenceHackData } from "$src/ports/packets/hackRequestPacket";
import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type HackActionDataPacket = PortPacket<
  PortPacketType.HackActionData,
  {
    server: string;
    stock: boolean;
    reference: ReferenceHackData;
  }
>;

export function newHackActionDataPacket(
  server: string,
  stock: boolean,
  reference: ReferenceHackData,
): HackActionDataPacket {
  return {
    type: PortPacketType.HackActionData,
    server,
    stock,
    reference,
  };
}
