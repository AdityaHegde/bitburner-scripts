/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { asyncWait } from "$server/utils/asyncUtils";
import { GrowTimeMulti, MetadataFile, WeakenTimeMulti } from "$src/constants";
import type {
  BasicHGWOptions,
  BitNodeMultipliers,
  Bladeburner,
  CodingContract,
  Corporation,
  FilenameOrPID,
  Formulas,
  Gang,
  Grafting,
  HackingMultipliers,
  Hacknet,
  HacknetMultipliers,
  Infiltration,
  MoneySources,
  NetscriptPort,
  NS,
  NSEnums,
  Player,
  PortData,
  ProcessInfo,
  RecentScript,
  RunningScript,
  ScriptArg,
  Server,
  Singularity,
  Sleeve,
  Stanek,
  TIX,
  ToastVariant,
  UserInterface,
} from "$src/types/gameTypes";
import { MockedPlayer } from "./MockedPlayer";
import { MockedPort } from "./MockedPort";
import { MockedScript } from "./MockedScript";
import type { MockedServer } from "./MockedServer";
import { getMockedMetadata } from "./mockFactory";

export class NSMock implements NS {
  args: (string | number | boolean)[];
  bladeburner: Bladeburner;
  codingcontract: CodingContract;
  corporation: Corporation;
  enums: NSEnums;
  formulas: Formulas;
  gang: Gang;
  grafting: Grafting;
  hacknet: Hacknet;
  infiltration: Infiltration;
  singularity: Singularity;
  sleeve: Sleeve;
  stanek: Stanek;
  stock: TIX;
  ui: UserInterface;

  public server: string;
  public threads: number;

  public constructor(
    private readonly servers: Record<string, MockedServer> = {},
    private readonly ports: Record<number, MockedPort> = {},
    private readonly player = new MockedPlayer(),
  ) {}

  // custom methods used in tests

  public copy(): NSMock {
    return new NSMock(this.servers, this.ports, this.player);
  }

  public addServer(server: MockedServer) {
    this.servers[server.hostname] = server;
  }

  // inbuilt methods

  alert(msg: string): void {}

  asleep(millis: number): Promise<true> {
    return Promise.resolve(true);
  }

  atExit(f: () => void): void {}

  brutessh(host: string): void {}

  clear(handle: string): void {}

  clearLog(): void {}

  clearPort(handle: number): void {}

  closeTail(pid?: number): void {}

  deleteServer(host: string): boolean {
    return false;
  }

  disableLog(fn: string): void {}

  enableLog(fn: string): void {}

  exec(
    script: string,
    host: string,
    numThreads?: number,
    ...args: (string | number | boolean)[]
  ): number {
    const scr = new MockedScript(script, args, host, numThreads ?? 0);
    scr.start(this);
    return scr.pid;
  }

  exit(): never {
    return undefined as never;
  }

  fileExists(filename: string, host?: string): boolean {
    return false;
  }

  flags(schema: [string, string | number | boolean | string[]][]): {
    [p: string]: ScriptArg | string[];
  } {
    return {};
  }

  ftpcrack(host: string): void {}

  getBitNodeMultipliers(n?: number, lvl?: number): BitNodeMultipliers {
    return undefined;
  }

  getFavorToDonate(): number {
    return 0;
  }

  getGrowTime(host: string): number {
    return this.servers[host].time * GrowTimeMulti;
  }

  getHackTime(host: string): number {
    return this.servers[host].time;
  }

  getHackingLevel(): number {
    return this.player.hackingLevel;
  }

  getHackingMultipliers(): HackingMultipliers {
    return undefined;
  }

  getHacknetMultipliers(): HacknetMultipliers {
    return undefined;
  }

  getHostname(): string {
    return "";
  }

  getMoneySources(): MoneySources {
    return undefined;
  }

  getPlayer(): Player {
    return undefined;
  }

  getPortHandle(port: number): NetscriptPort {
    this.ports[port] ??= new MockedPort();
    return this.ports[port];
  }

  getPurchasedServerCost(ram: number): number {
    return 0;
  }

  getPurchasedServerLimit(): number {
    return 0;
  }

  getPurchasedServerMaxRam(): number {
    return 0;
  }

  getPurchasedServerUpgradeCost(hostname: string, ram: number): number {
    return 0;
  }

  getPurchasedServers(): string[] {
    return [];
  }

  getRecentScripts(): RecentScript[] {
    return [];
  }

  getRunningScript(
    filename?: FilenameOrPID,
    hostname?: string,
    ...args: (string | number | boolean)[]
  ): RunningScript | null {
    return undefined;
  }

  getScriptExpGain(script: string, host: string, ...args: (string | number | boolean)[]): number {
    return 0;
  }

  getScriptIncome(script: string, host: string, ...args: (string | number | boolean)[]): number {
    return 0;
  }

  getScriptLogs(fn?: string, host?: string, ...args: (string | number | boolean)[]): string[] {
    return [];
  }

  getScriptName(): string {
    return "";
  }

  getScriptRam(script: string, host?: string): number {
    return 0;
  }

  getServer(host?: string): Server {
    return this.servers[host];
  }

  getServerBaseSecurityLevel(host: string): number {
    return this.servers[host].baseDifficulty;
  }

  getServerGrowth(host: string): number {
    return this.servers[host].serverGrowth;
  }

  getServerMaxMoney(host: string): number {
    return this.servers[host].moneyMax;
  }

  getServerMaxRam(host: string): number {
    return this.servers[host].maxRam;
  }

  getServerMinSecurityLevel(host: string): number {
    return this.servers[host].minDifficulty;
  }

  getServerMoneyAvailable(host: string): number {
    return this.servers[host].moneyAvailable;
  }

  getServerNumPortsRequired(host: string): number {
    return this.servers[host].numOpenPortsRequired;
  }

  getServerRam(host: string): [number, number] {
    return [0, 0];
  }

  getServerRequiredHackingLevel(host: string): number {
    return this.servers[host].requiredHackingSkill;
  }

  getServerSecurityLevel(host: string): number {
    return this.servers[host].hackDifficulty;
  }

  getServerUsedRam(host: string): number {
    return this.servers[host].ramUsed;
  }

  getSharePower(): number {
    return 0;
  }

  getTimeSinceLastAug(): number {
    return 0;
  }

  getTotalScriptExpGain(): number {
    return 0;
  }

  getTotalScriptIncome(): [number, number] {
    return [0, 0];
  }

  getWeakenTime(host: string): number {
    return this.servers[host].time * WeakenTimeMulti;
  }

  async grow(host: string, opts?: BasicHGWOptions): Promise<number> {
    await asyncWait(this.servers[host].time * GrowTimeMulti);
    this.servers[host].grow(this.threads);
    this.player.add(this.threads * 10, 0);
    return Promise.resolve(0);
  }

  growthAnalyze(host: string, growthAmount: number, cores?: number): number {
    return growthAmount / this.servers[host].serverGrowth;
  }

  growthAnalyzeSecurity(threads: number, hostname?: string, cores?: number): number {
    return 0;
  }

  async hack(host: string, opts?: BasicHGWOptions): Promise<number> {
    await asyncWait(this.servers[host].time);
    this.player.add(this.threads * 10, this.servers[host].hack(this.threads));
    return Promise.resolve(0);
  }

  hackAnalyze(host: string): number {
    return this.servers[host].rate;
  }

  hackAnalyzeChance(host: string): number {
    return 0;
  }

  hackAnalyzeSecurity(threads: number, hostname?: string): number {
    return 0;
  }

  hackAnalyzeThreads(host: string, hackAmount: number): number {
    return 0;
  }

  hasRootAccess(host: string): boolean {
    return false;
  }

  hasTorRouter(): boolean {
    return false;
  }

  httpworm(host: string): void {}

  isLogEnabled(fn: string): boolean {
    return false;
  }

  isRunning(script: FilenameOrPID, host?: string, ...args: (string | number | boolean)[]): boolean {
    return false;
  }

  kill(script: number): boolean;
  kill(script: string, host: string, ...args: (string | number | boolean)[]): boolean;
  kill(script: number | string, host?: string, ...args: (string | number | boolean)[]): boolean {
    return false;
  }

  killall(host?: string, safetyguard?: boolean): boolean {
    return false;
  }

  ls(host: string, grep?: string): string[] {
    return [];
  }

  moveTail(x: number, y: number, pid?: number): void {}

  mv(host: string, source: string, destination: string): void {}

  nFormat(n: number, format: string): string {
    return "";
  }

  nuke(host: string): void {}

  peek(port: number): PortData {
    return undefined;
  }

  print(...args: any[]): void {}

  printf(format: string, ...args: any[]): void {
    console.log(format.replace(/\n/, ""), ...args);
  }

  prompt(
    txt: string,
    options?: { type?: "boolean" | "text" | "select"; choices?: string[] },
  ): Promise<boolean | string> {
    return Promise.resolve(undefined);
  }

  ps(host?: string): ProcessInfo[] {
    return [];
  }

  purchaseServer(hostname: string, ram: number): string {
    return "";
  }

  read(filename: string): string {
    switch (filename) {
      case MetadataFile:
        return JSON.stringify(getMockedMetadata());
    }
    return "";
  }

  readPort(port: number): PortData {
    return undefined;
  }

  relaysmtp(host: string): void {}

  renamePurchasedServer(hostname: string, newName: string): boolean {
    return false;
  }

  resizeTail(width: number, height: number, pid?: number): void {}

  rm(name: string, host?: string): boolean {
    return false;
  }

  run(script: string, numThreads?: number, ...args: (string | number | boolean)[]): number {
    return 0;
  }

  scan(host?: string): string[] {
    return [];
  }

  scp(files: string | string[], destination: string, source?: string): boolean {
    return false;
  }

  scriptKill(script: string, host: string): boolean {
    return false;
  }

  scriptRunning(script: string, host: string): boolean {
    return false;
  }

  serverExists(host: string): boolean {
    return false;
  }

  share(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async sleep(millis: number): Promise<true> {
    await asyncWait(millis);
    return true;
  }

  spawn(script: string, numThreads?: number, ...args: (string | number | boolean)[]): void {}

  sprintf(format: string, ...args: any[]): string {
    return args.join(" ");
  }

  sqlinject(host: string): void {}

  tFormat(milliseconds: number, milliPrecision?: boolean): string {
    return "";
  }

  tail(fn?: FilenameOrPID, host?: string, ...args: (string | number | boolean)[]): void {}

  toast(msg: string, variant?: ToastVariant | `${ToastVariant}`, duration?: number | null): void {}

  tprint(...args: any[]): void {}

  tprintf(format: string, ...values: any[]): void {}

  tryWritePort(port: number, data: string | number): boolean {
    return false;
  }

  upgradePurchasedServer(hostname: string, ram: number): boolean {
    return false;
  }

  vsprintf(format: string, args: any[]): string {
    return args.join(" ");
  }

  async weaken(host: string, opts?: BasicHGWOptions): Promise<number> {
    await asyncWait(this.servers[host].time * WeakenTimeMulti);
    this.servers[host].weaken(this.threads);
    this.player.add(this.threads * 10, 0);
    return 0;
  }

  weakenAnalyze(threads: number, cores?: number): number {
    return 0;
  }

  wget(url: string, target: string, host?: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  write(filename: string, data?: string, mode?: "w" | "a"): void {
    // console.log(data);
  }

  writePort(port: number, data: string | number): PortData | null {
    return undefined;
  }
}
