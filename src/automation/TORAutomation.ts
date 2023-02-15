export abstract class TORAutomation {
  public abstract buyTorServer(): Promise<void>;

  public abstract buyCrack(name: string): Promise<void>;
}
