/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  CityName,
  CrimeStats,
  CrimeType,
  FactionWorkType,
  Multipliers,
  Singularity,
  SourceFileLvl,
} from "$src/types/gameTypes";
import type { NSMock } from "./NSMock";

export class MockedSingularity implements Singularity {
  public constructor(private ns: NSMock) {}

  applyToCompany(companyName: string, field: string): boolean {
    return false;
  }

  b1tflum3(nextBN: number, callbackScript?: string): void {}

  checkFactionInvitations(): string[] {
    return [];
  }

  commitCrime(crime: CrimeType | `${CrimeType}`, focus?: boolean): number {
    return 0;
  }

  connect(hostname: string): boolean {
    return false;
  }

  createProgram(program: string, focus?: boolean): boolean {
    return false;
  }

  destroyW0r1dD43m0n(nextBN: number, callbackScript?: string): void {}

  donateToFaction(faction: string, amount: number): boolean {
    return false;
  }

  exportGame(): void {}

  exportGameBonus(): boolean {
    return false;
  }

  getAugmentationBasePrice(augName: string): number {
    return 0;
  }

  getAugmentationPrereq(augName: string): string[] {
    return [];
  }

  getAugmentationPrice(augName: string): number {
    return 0;
  }

  getAugmentationRepReq(augName: string): number {
    return 0;
  }

  getAugmentationStats(name: string): Multipliers {
    return undefined;
  }

  getAugmentationsFromFaction(faction: string): string[] {
    return [];
  }

  getCompanyFavor(companyName: string): number {
    return 0;
  }

  getCompanyFavorGain(companyName: string): number {
    return 0;
  }

  getCompanyRep(companyName: string): number {
    return 0;
  }

  getCrimeChance(crime: CrimeType | `${CrimeType}`): number {
    return 0;
  }

  getCrimeStats(crime: CrimeType | `${CrimeType}`): CrimeStats {
    return undefined;
  }

  getCurrentServer(): string {
    return "";
  }

  getCurrentWork(): any {}

  getDarkwebProgramCost(programName: string): number {
    return 0;
  }

  getDarkwebPrograms(): string[] {
    return [];
  }

  getFactionFavor(faction: string): number {
    return 0;
  }

  getFactionFavorGain(faction: string): number {
    return 0;
  }

  getFactionRep(faction: string): number {
    return 0;
  }

  getOwnedAugmentations(purchased?: boolean): string[] {
    return [];
  }

  getOwnedSourceFiles(): SourceFileLvl[] {
    return [];
  }

  getUpgradeHomeCoresCost(): number {
    return 0;
  }

  getUpgradeHomeRamCost(): number {
    return 0;
  }

  goToLocation(locationName: string): boolean {
    return false;
  }

  gymWorkout(gymName: string, stat: string, focus?: boolean): boolean {
    return false;
  }

  hospitalize(): void {}

  installAugmentations(cbScript?: string): void {}

  installBackdoor(): Promise<void> {
    return Promise.resolve(undefined);
  }

  isBusy(): boolean {
    return false;
  }

  isFocused(): boolean {
    return false;
  }

  joinFaction(faction: string): boolean {
    return false;
  }

  manualHack(): Promise<number> {
    return Promise.resolve(0);
  }

  purchaseAugmentation(faction: string, augmentation: string): boolean {
    return false;
  }

  purchaseProgram(programName: string): boolean {
    this.ns.hasFiles[programName] = true;
    return true;
  }

  purchaseTor(): boolean {
    this.ns.hasTor = true;
    return true;
  }

  quitJob(companyName?: string): void {}

  setFocus(focus: boolean): boolean {
    return false;
  }

  softReset(cbScript: string): void {}

  stopAction(): boolean {
    return false;
  }

  travelToCity(city: CityName | `${CityName}`): boolean {
    return false;
  }

  universityCourse(universityName: string, courseName: string, focus?: boolean): boolean {
    return false;
  }

  upgradeHomeCores(): boolean {
    return false;
  }

  upgradeHomeRam(): boolean {
    return false;
  }

  workForCompany(companyName: string, focus?: boolean): boolean {
    return false;
  }

  workForFaction(
    faction: string,
    workType: FactionWorkType | `${FactionWorkType}`,
    focus?: boolean,
  ): boolean {
    return false;
  }
}
