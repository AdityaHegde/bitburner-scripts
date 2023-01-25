import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type ReferenceHackData = {
  operationIndex: number;
  groupIndex: number;
};
export type HackRequestPacket = PortPacket<
  PortPacketType.HackRequest,
  {
    server: string;
    start: number;
    end: number;
    period: number;
    count: number;
    reference: ReferenceHackData;
  }
>;

export function newHackRequestPacket(
  server: string,
  start: number,
  end: number,
  period: number,
  count: number,
  reference: ReferenceHackData,
): HackRequestPacket {
  return {
    type: PortPacketType.HackRequest,
    server,
    start,
    end,
    period,
    count,
    reference,
  };
}
