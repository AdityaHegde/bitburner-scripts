import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type BatchStartedPacket = PortPacket<
  PortPacketType.BatchStarted,
  {
    port: number;
    hackTime: number;
    endTime: number;
  }
>;

export function newBatchStartedPacket(
  port: number,
  hackTime: number,
  endTime: number,
): BatchStartedPacket {
  return {
    type: PortPacketType.BatchStarted,
    port,
    hackTime,
    endTime,
  };
}
