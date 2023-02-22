import { Second } from "$src/constants";

export const MaxMembers = 12;
export const MemberPrefix = "thug-";

export enum GangMemberMode {
  Train,
  WantedLevel,
  Active,
}

export const GangMemberAscensionThreshold = 1.25;
export const GangMemberTrainLevel = 50;
export const WantedLevelGangMemberThreshold = 6;
export const WantedLevelUpperThreshold = 0.1;
export const WantedLevelLowerThreshold = 0.05;
// do not lower wanted level too low, just not worth it
export const WantedLevelAbsoluteUpperThreshold = 2000;
export const WantedLevelAbsoluteLowerThreshold = 1000;
export const GangRespectThreshold = 10e6;

export enum GangMemberRole {
  Money,
  Respect,
  Territory,
}

export const CombatTasks = {
  "Mug People": 0,
  "Strongarm Civilians": 1,
  "Run a Con": 2,
  "Armed Robbery": 3,
  "Human Trafficking": 4,
  "Traffick Illegal Arms": 5,
};

// Stats related

export const TaskStats = [
  "hackWeight",
  "strWeight",
  "defWeight",
  "dexWeight",
  "agiWeight",
  "chaWeight",
];

export const Stats = ["hack", "str", "def", "dex", "agi", "cha"];
export type PrimarySingleStats = "str" | "hack" | "cha";
export const PrimaryStats: Record<PrimarySingleStats, Array<string>> = {
  str: ["str", "def", "agi", "dex"],
  hack: ["hack"],
  cha: ["cha"],
};

// Upgrade related

export enum GangUpgradeType {
  Weapon = "Weapon",
  Armor = "Armor",
  Vehicle = "Vehicle",
  Rootkit = "Rootkit",
  Augmentation = "Augmentation",
}

export const GangUpgradesByType: Record<PrimarySingleStats, Array<GangUpgradeType>> = {
  str: [
    GangUpgradeType.Armor,
    GangUpgradeType.Augmentation,
    GangUpgradeType.Weapon,
    GangUpgradeType.Vehicle,
  ],
  hack: [
    GangUpgradeType.Armor,
    GangUpgradeType.Augmentation,
    GangUpgradeType.Rootkit,
    GangUpgradeType.Vehicle,
  ],
  cha: [
    GangUpgradeType.Armor,
    GangUpgradeType.Augmentation,
    GangUpgradeType.Weapon,
    GangUpgradeType.Vehicle,
    GangUpgradeType.Rootkit,
  ],
};

export const GangUpgradeMoneyBuffer = 2.5;
export const NonAugUpgradeMoneyBuffer = 5;
export const ArmourUpgradeMoneyBuffer = 5;
export const UpgradeStatMultiThreshold = 20;
export const NonAugUpgradeRespectThreshold = 5e6;

// Warfare related

export const DefenceThreshold = 1000;
export const WinChanceThreshold = 0.55;
export const TerritoryTick = 20 * Second;
