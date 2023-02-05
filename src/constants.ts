export const PlayerServerPrefix = "player-server-";

export const MetadataFile = "metadata.txt";

export const WriteRemoteMetadataScript = "writeRemoteMetadata.js";

export const BatchOperationBuffer = 200;

export const GrowTimeMulti = 3.2;
export const WeakenTimeMulti = 4;
export const SharePowerTime = 10000;
export const HackPercent = 0.25;
// hack correction for growth
export const HackGrowthPercent = 0.3;
export const HackLevelMulti = 2;

export const ServerFortifyAmount = 0.002;
export const ServerWeakenAmount = 0.05;
export const WeakenThreadsPerGrowCall = ServerWeakenAmount / (2 * ServerFortifyAmount);
export const WeakenThreadsPerHackCall = ServerWeakenAmount / ServerFortifyAmount;

export const HalfOfMaxServerSize = 2 ** 10;
export const MaxServerSize = HalfOfMaxServerSize ** 10;

export const HackGroupSize = 3;

export const Second = 1000;
export const Minute = Second * 60;

export const HackBatchPercents = [1, 0.95, 0.9, 0.8, 0.7, 0.5];
