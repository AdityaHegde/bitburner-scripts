import { ServerFortifyAmount, ServerWeakenAmount } from "$src/constants";
import type { Server } from "$src/types/gameTypes";

export class MockedServer implements Server {
  baseDifficulty: number;
  hackDifficulty: number;

  cpuCores: number;

  moneyAvailable: number;

  ramUsed: number;

  backdoorInstalled: boolean;
  hasAdminRights: boolean;
  ip: string;
  isConnectedTo: boolean;
  organizationName: string;
  purchasedByPlayer: boolean;

  openPortCount: number;
  sshPortOpen: boolean;
  ftpPortOpen: boolean;
  smtpPortOpen: boolean;
  httpPortOpen: boolean;
  sqlPortOpen: boolean;

  public constructor(
    public readonly hostname: string,
    public readonly numOpenPortsRequired: number,
    public readonly minDifficulty: number,
    public readonly moneyMax: number,
    public readonly requiredHackingSkill: number,
    public readonly serverGrowth: number,
    public maxRam: number,
    public time: number,
    public rate: number,
  ) {
    this.ramUsed = 0;
    this.hackDifficulty = minDifficulty + 5;
    this.moneyAvailable = Math.round(this.moneyMax / 2);
  }

  public grow(multi: number) {
    this.hackDifficulty = Math.min(100, this.hackDifficulty + 2 * ServerFortifyAmount * multi);
    this.moneyAvailable = Math.min(this.moneyMax, this.moneyAvailable * this.serverGrowth * multi);
  }

  public weaken(multi: number) {
    this.hackDifficulty = Math.max(
      this.minDifficulty,
      this.hackDifficulty - ServerWeakenAmount * multi,
    );
  }

  public hack(multi: number): number {
    const hacked = this.moneyAvailable * this.rate * multi;
    this.hackDifficulty = Math.min(100, this.hackDifficulty + ServerFortifyAmount * multi);
    this.moneyAvailable = this.moneyAvailable - hacked;
    return hacked;
  }
}
