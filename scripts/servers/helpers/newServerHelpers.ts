import type { NetscriptPort, NS } from "$scripts/types/gameTypes";
import { readPacketFromPort } from "$scripts/utils/portCommunication";

export const NewServerCommunicationPort = 1;

export enum NewServerType {
  NoData,
  NPC,
  Player,
  PlayerUpdate,
}

export type NewServerPacket = [type: NewServerType, ...servers: Array<string>];

export async function readNewServerPacket(
  ns: NS,
  portHandle: NetscriptPort,
): Promise<NewServerPacket> {
  const [type, ...servers] = await readPacketFromPort(ns, portHandle, true);
  if (!type) {
    return [0];
  }
  return [Number(type), ...servers];
}
