import { NS } from "./gameTypes";

export type CrackType = (
  "BruteSSH" |
  "FTPCrack" |
  "RelaySMTP" |
  "HTTPWorm" |
  "SQLInject"
);
export const CrackTypeToFile: Record<CrackType, string> = {
  "BruteSSH": "BruteSSH.exe",
  "FTPCrack": "FTPCrack.exe",
  "RelaySMTP": "relaySMTP.exe",
  "HTTPWorm": "HTTPWorm.exe",
  "SQLInject": "SQLInject.exe",
};
export const MaxCracksCount = Object.keys(CrackTypeToFile).length;

export const CrackRequiredLevel: Record<CrackType, number> = {
  "BruteSSH": 50,
  "FTPCrack": 100,
  "RelaySMTP": 250,
  "HTTPWorm": 500,
  "SQLInject": 750,
}

export function runCracks(
  ns: NS, cracks: Array<CrackType>,
  server: string, requiredPorts: number,
) {
  for (let i = 0; i < requiredPorts && i < cracks.length; i++) {
    // using the map CrackTypeToMethod to run the command does not add to script mem
    // hence using the methods directly to not exploit
    switch (cracks[i]) {
      case "BruteSSH":
        ns.brutessh(server);
        break;

      case "FTPCrack":
        ns.ftpcrack(server);
        break;

      case "RelaySMTP":
        ns.relaysmtp(server);
        break;

      case "HTTPWorm":
        ns.httpworm(server);
        break;

      case "SQLInject":
        ns.sqlinject(server);
        break;
    }
  }
}
