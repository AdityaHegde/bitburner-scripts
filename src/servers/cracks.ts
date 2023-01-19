import type { NS } from "../types/gameTypes";

export const ListOfCracks: Array<string> = [
  "BruteSSH.exe",
  "FTPCrack.exe",
  "RelaySMTP.exe",
  "HTTPWorm.exe",
  "SQLInject.exe",
];

export class Cracks {
  public cracks = new Array<number>();

  public constructor(private readonly ns: NS) {}

  public collectCracks() {
    for (let i = this.cracks.length; i < ListOfCracks.length; i++) {
      if (this.ns.fileExists(ListOfCracks[i], "home")) {
        this.cracks.push(i);
      } else {
        // cracks are available in order
        break;
      }
    }
  }

  public crackNPCServer(server: string): boolean {
    const requiredPorts = this.ns.getServerNumPortsRequired(server);

    if (requiredPorts > this.cracks.length) return false;

    this.runCracks(server, requiredPorts);
    this.ns.nuke(server);

    return true;
  }

  public runCracks(server: string, requiredPorts: number) {
    for (let i = 0; i < requiredPorts && i < this.cracks.length; i++) {
      // using the map CrackTypeToMethod to run the command does not add to script mem
      // hence using the methods directly to not exploit
      switch (this.cracks[i]) {
        case 0:
          this.ns.brutessh(server);
          break;

        case 1:
          this.ns.ftpcrack(server);
          break;

        case 2:
          this.ns.relaysmtp(server);
          break;

        case 3:
          this.ns.httpworm(server);
          break;

        case 4:
          this.ns.sqlinject(server);
          break;
      }
    }
  }
}
