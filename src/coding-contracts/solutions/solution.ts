import {
  algorithmicStockTraderV1,
  algorithmicStockTraderV2,
  algorithmicStockTraderV3,
  algorithmicStockTraderV4,
} from "$src/coding-contracts/solutions/algorithmicStockTrader";
import {
  arrayJumpingGameV1,
  arrayJumpingGameV2,
} from "$src/coding-contracts/solutions/arrayJumpingGame";
import { lreCompression } from "$src/coding-contracts/solutions/compression";
import { decodeHammingCode, encodeHammingCode } from "$src/coding-contracts/solutions/hammingCodes";
import { largestPrimeFactor } from "$src/coding-contracts/solutions/largestPrimeFactor";
import { minPathInTriangle } from "$src/coding-contracts/solutions/minPathInTriangle";
import { overlappingIntervals } from "$src/coding-contracts/solutions/overlappingIntervals";
import { spiralizeMatrix } from "$src/coding-contracts/solutions/spiralizeMatrix";
import {
  uniquePathsInGridV1,
  uniquePathsInGridV2,
} from "$src/coding-contracts/solutions/uniquePathsInGrid";
import { waysToSum } from "$src/coding-contracts/solutions/waysToSum";

export type SolutionFunction<InputType, OutputType> = (input: InputType) => OutputType;

const NameToSolutionFunction: Record<string, SolutionFunction<any, any>> = {
  "Find Largest Prime Factor": largestPrimeFactor,
  // TODO
  "Subarray with Maximum Sum": undefined,
  "Total Ways to Sum": waysToSum,
  // TODO
  "Total Ways to Sum II": undefined,
  "Spiralize Matrix": spiralizeMatrix,
  "Array Jumping Game": arrayJumpingGameV1,
  "Array Jumping Game II": arrayJumpingGameV2,
  "Merge Overlapping Intervals": overlappingIntervals,

  // TODO
  "Generate IP Addresses": undefined,

  "Algorithmic Stock Trader I": algorithmicStockTraderV1,
  "Algorithmic Stock Trader II": algorithmicStockTraderV2,
  "Algorithmic Stock Trader III": algorithmicStockTraderV3,
  "Algorithmic Stock Trader VI": algorithmicStockTraderV4,

  "Minimum Path Sum in a Triangle": minPathInTriangle,

  "Unique Paths in a Grid I": uniquePathsInGridV1,
  "Unique Paths in a Grid II": uniquePathsInGridV2,

  "HammingCodes: Integer to Encoded Binary": encodeHammingCode,
  "HammingCodes: Encoded Binary to Integer": decodeHammingCode,

  "Compression I: RLE Compression": lreCompression,

  // TODO others
};

export function runSolution(name: string, input: any): any {
  if (!NameToSolutionFunction[name]) return undefined;
  return NameToSolutionFunction[name](input);
}
