import { runSolution } from "$src/coding-contracts/solutions/solution";

onmessage = function (e) {
  postMessage(runSolution(e.data[0], e.data[1]));
};
