import type { SolutionFunction } from "$src/coding-contracts/solutions/solution";
import { binarySearch } from "$src/utils/arrayUtils";

type Interval = [number, number];

function intervalOverlaps(src: Interval, tar: Interval) {
  // src lower bound is after tar upper bound
  if (src[0] > tar[1]) return -1;
  // src upper bound is before tar lower bound
  if (src[1] < tar[0]) return 1;
  return 0;
}

function mergeIntervals(src: Interval, tar: Interval) {
  src[0] = Math.min(src[0], tar[0]);
  src[1] = Math.max(src[1], tar[1]);
}

export const overlappingIntervals: SolutionFunction<Array<Interval>, Array<Interval>> = (input) => {
  const intervals = new Array<Interval>(input[0]);

  for (let i = 1; i < input.length; i++) {
    const interval = input[i];
    let matched = 1;
    const index = binarySearch(intervals, (mid) => {
      matched = intervalOverlaps(interval, mid);
      return matched;
    });

    if (matched === 0) {
      mergeIntervals(intervals[index], interval);

      if (
        index + 1 < intervals.length &&
        intervalOverlaps(intervals[index], intervals[index + 1]) === 0
      ) {
        // if the new interval overlaps with next merge them
        mergeIntervals(intervals[index], intervals[index + 1]);
        intervals.splice(index + 1, 1);
      }

      if (index - 1 >= 0 && intervalOverlaps(intervals[index], intervals[index - 1]) === 0) {
        // if the new interval overlaps with previous merge them
        mergeIntervals(intervals[index], intervals[index - 1]);
        intervals.splice(index - 1, 1);
      }
    } else {
      intervals.splice(index + 1, 0, interval);
    }
  }

  return intervals;
};
