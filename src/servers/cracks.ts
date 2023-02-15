import type { ServerData } from "$src/servers/serverData";
import type { NS } from "../types/gameTypes";

export const ListOfCracks: Array<string> = [
  "BruteSSH.exe",
  "FTPCrack.exe",
  "RelaySMTP.exe",
  "HTTPWorm.exe",
  "SQLInject.exe",
];
export const CostOfCracks: Array<number> = [500e3, 1500e3, 5e6, 30e6, 250e6];
export const CostOfTOR = 200e3;

export const FormulaName = "Formulas.exe";
export const FormulaPrice = 5e9;

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

  public crackNPCServer(serverData: ServerData): boolean {
    if (serverData.requiredPorts > this.cracks.length) return false;

    this.runCracks(serverData.name, serverData.requiredPorts);
    this.ns.nuke(serverData.name);

    return true;
  }

  private runCracks(server: string, requiredPorts: number) {
    for (let i = 0; i < requiredPorts && i < this.cracks.length; i++) {
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
