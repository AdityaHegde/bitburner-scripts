import type { ServerAction } from "$src/servers/server-actions/serverAction";
import type { ServerData } from "$src/servers/serverData";

export type ServerActionAssignment = [serverData: ServerData, threads: number];
export type ServerActionAssignments = Array<ServerActionAssignment>;

export class ServerActionBatch {
  public reservations: Array<ServerActionAssignments>;
  public assignments: Array<ServerActionAssignments>;

  public constructor(
    public readonly actions: Array<ServerAction>,
    public readonly threads: Array<number>,
  ) {}
}
