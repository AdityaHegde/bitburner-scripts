export class MockedPlayer {
  public hackingLevel = 1;
  public money: number;
  private exp = 0;

  public add(exp: number, money: number) {
    this.exp += exp;
    this.hackingLevel += Math.floor(this.exp / 25);
    this.exp %= 25;

    this.money += money;
  }
}
