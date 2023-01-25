export enum PortPacketType {
  HackActionData,
  ServerStarted,
  HackRequest,
  HackResponse,
  HackTiming,
  StopHack,
  HackStopped,
  Exit,
  Exited,
}

export type PortPacket<Type extends PortPacketType, Rec> = {
  type: Type;
} & Rec;

export type AnyPortPacket = PortPacket<PortPacketType, object>;
