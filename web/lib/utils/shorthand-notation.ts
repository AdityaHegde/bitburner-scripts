/**
 * Library to convert numbers to various shorthand notations
 */

/**
 * Define the schema here
 */
export class ShorthandNotationSchema {
  public static numbers = new ShorthandNotationSchema(
    ["", ..."kMBTQ".split("")],
    new Array(5).fill(1000),
    "",
    "",
    2,
  );
  public static diskSpace = new ShorthandNotationSchema(
    ["", ..."KMT".split("")],
    new Array(3).fill(1024),
    "",
    "B",
    2,
  );
  public static usd = new ShorthandNotationSchema(
    ["", ..."kmbtq".split("")],
    new Array(5).fill(1000),
    "",
    "$",
    2,
  );
  public static time = new ShorthandNotationSchema(
    ["ms", "s", "min", "hour"],
    [1000, 60, 60],
    "",
    "",
    2,
  );

  public constructor(
    private readonly notations: Array<string>,
    private readonly degrees: Array<number>,
    private readonly prefix: string,
    private readonly suffix: string,
    private readonly precision: number,
  ) {
    if (notations.length !== degrees.length + 1) {
      throw new Error("invalid arguments");
    }
  }

  public convert(num: number): string {
    let i = 0;
    for (; i < this.notations.length - 1; i++) {
      if (this.degrees[i] > num) break;
      num = num / this.degrees[i];
    }
    return `${this.prefix}${num.toFixed(this.precision)}${this.notations[i]}${this.suffix}`;
  }
}
