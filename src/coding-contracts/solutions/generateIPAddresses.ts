import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";

function isValidPart(part: string) {
  const num = Number(part);
  if (num === 0) return part.length === 1;
  if (part.charAt(0) === "0") return false;
  return num >= 0 && num <= 255;
}

export const generateIPAddresses: SolutionFunction<string, Array<string>> = (input) => {
  const possibilities = new Array<string>();

  for (let fourthIdx = 4; fourthIdx < input.length; fourthIdx++) {
    let partFour = input.substring(fourthIdx);
    while (!isValidPart(partFour)) {
      fourthIdx++;
      partFour = input.substring(fourthIdx);
    }

    for (let thirdIdx = 3; thirdIdx < fourthIdx; thirdIdx++) {
      let partThree = input.substring(thirdIdx, fourthIdx);
      while (!isValidPart(input.substring(thirdIdx, fourthIdx)) && thirdIdx < fourthIdx) {
        thirdIdx++;
        partThree = input.substring(thirdIdx, fourthIdx);
      }
      if (thirdIdx === fourthIdx) break;

      for (let secondIdx = 1; secondIdx < thirdIdx; secondIdx++) {
        const partOne = input.substring(0, secondIdx);
        const partTwo = input.substring(secondIdx, thirdIdx);
        if (isValidPart(partOne) && isValidPart(partTwo)) {
          possibilities.push(`${partOne}.${partTwo}.${partThree}.${partFour}`);
        }
      }
    }
  }

  return possibilities;
};
