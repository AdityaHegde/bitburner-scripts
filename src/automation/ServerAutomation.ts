export abstract class ServerAutomation {
  public abstract connectToServer(server: string): Promise<void>;

  public abstract installBackdoor(server: string): Promise<void>;
}
