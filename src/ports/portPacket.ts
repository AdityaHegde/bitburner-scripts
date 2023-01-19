export enum PortPacketType {
  ServerStarted,
  HackRequest,
  HackResponse,
  StopHack,
  HackStopped,
  Exit,
  Exited,
}

export type PortPacket<Type extends PortPacketType, Rec> = {
  type: Type;
} & Rec;

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

export type HackResponsePacket = PortPacket<
  PortPacketType.HackResponse,
  {
    port: number;
    target: string;
    reference: ReferenceHackData;
  }
>;

export function newHackResponsePacket(
  port: number,
  target: string,
  reference: ReferenceHackData,
): HackResponsePacket {
  return {
    type: PortPacketType.HackResponse,
    port,
    target,
    reference,
  };
}

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

export type HackStoppedPacket = PortPacket<
  PortPacketType.HackStopped,
  {
    port: number;
  }
>;

export function newHackStoppedPacket(port: number): HackStoppedPacket {
  return {
    type: PortPacketType.HackStopped,
    port,
  };
}

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

export type ExitedPacket = PortPacket<
  PortPacketType.Exited,
  {
    port: number;
  }
>;

export function newExitedPacket(port: number): ExitedPacket {
  return {
    type: PortPacketType.Exited,
    port,
  };
}
