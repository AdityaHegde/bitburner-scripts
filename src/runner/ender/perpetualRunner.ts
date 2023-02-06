export interface RunnerEnder {
  shouldEnd(): boolean;
}

export class PerpetualRunner implements RunnerEnder {
  public shouldEnd(): boolean {
    return false;
  }
}
