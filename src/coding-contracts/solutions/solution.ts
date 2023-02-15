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
import { waysToSum, waysToSumLimited } from "$src/coding-contracts/solutions/waysToSum";
import { generateIPAddresses } from "$src/coding-contracts/solutions/generateIPAddresses";
import { maxSumSubarray } from "$src/coding-contracts/solutions/maxSumSubarray";
import { shortestPath } from "$src/coding-contracts/solutions/shortestPath";
import { CeaserCipher, VigenereCipher } from "$src/coding-contracts/solutions/Ciphers";
import {
  LempelZivCompression,
  LempelZivDecompression,
} from "$src/coding-contracts/solutions/LempelZiv";
import { sanitizeParentheses } from "$src/coding-contracts/solutions/sanitizeParentheses";
import { validMathExpressions } from "$src/coding-contracts/solutions/validMathExpressions";
import { twoColoringOfGraph } from "$src/coding-contracts/solutions/twoColoringOfGraph";

export type SolutionFunction<InputType, OutputType> = (input: InputType) => OutputType;

export const NameToSolutionFunction: Record<string, SolutionFunction<any, any>> = {
  "Find Largest Prime Factor": largestPrimeFactor,
  "Subarray with Maximum Sum": maxSumSubarray,
  "Total Ways to Sum": waysToSum,
  "Total Ways to Sum II": waysToSumLimited,
  "Spiralize Matrix": spiralizeMatrix,
  "Array Jumping Game": arrayJumpingGameV1,
  "Array Jumping Game II": arrayJumpingGameV2,
  "Merge Overlapping Intervals": overlappingIntervals,
  "Generate IP Addresses": generateIPAddresses,
  "Algorithmic Stock Trader I": algorithmicStockTraderV1,
  "Algorithmic Stock Trader II": algorithmicStockTraderV2,
  "Algorithmic Stock Trader III": algorithmicStockTraderV3,
  "Algorithmic Stock Trader IV": algorithmicStockTraderV4,
  "Minimum Path Sum in a Triangle": minPathInTriangle,
  "Unique Paths in a Grid I": uniquePathsInGridV1,
  "Unique Paths in a Grid II": uniquePathsInGridV2,
  "Shortest Path in a Grid": shortestPath,
  "Sanitize Parentheses in Expression": sanitizeParentheses,
  "Find All Valid Math Expressions": validMathExpressions,
  "HammingCodes: Integer to Encoded Binary": encodeHammingCode,
  "HammingCodes: Encoded Binary to Integer": decodeHammingCode,
  "Proper 2-Coloring of a Graph": twoColoringOfGraph,
  "Compression I: RLE Compression": lreCompression,
  "Compression II: LZ Decompression": LempelZivDecompression,
  "Compression III: LZ Compression": LempelZivCompression,
  "Encryption I: Caesar Cipher": CeaserCipher,
  "Encryption II: Vigenère Cipher": VigenereCipher,
};

export function runSolution(name: string, input: any): any {
  if (!NameToSolutionFunction[name]) return undefined;
  return NameToSolutionFunction[name](input);
}
