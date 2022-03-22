import { NS } from "./gameTypes";

export enum CrackType {
  BruteSSH = "BruteSSH.exe",
  RelaySMTP = "relaySMTP.exe",
  FTPCrack = "FTPCrack.exe",
  HTTPWorm = "HTTPWorm.exe",
  SQLInject = "SQLInject.exe",
}
export const CrackTypeToMethod: {
  [crack in CrackType]: keyof NS
} = {
  [CrackType.BruteSSH]: "brutessh",
  [CrackType.RelaySMTP]: "relaysmtp",
  [CrackType.FTPCrack]: "ftpcrack",
  [CrackType.HTTPWorm]: "httpworm",
  [CrackType.SQLInject]: "sqlinject",
};
export const MaxCracksCount = Object.keys(CrackTypeToMethod).length;
