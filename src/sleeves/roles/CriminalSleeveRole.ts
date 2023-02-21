import { SleeveRole } from "$src/sleeves/roles/SleeveRole";
import type { CrimeType, Skills, SleevePerson, SleeveTask } from "$src/types/gameTypes";

// TODO: additional training
const DumbCrimeSteps: Array<{
  crime: CrimeType | `${CrimeType}`;
  stat: keyof Skills;
  nextLevel: number;
}> = [
  { crime: "Mug", stat: "agility", nextLevel: 250 },
  { crime: "Assassination", stat: "agility", nextLevel: -1 },
];

export class CriminalSleeveRole extends SleeveRole {
  private cursor: number;

  public init(sleeve: SleevePerson) {
    for (this.cursor = 0; this.cursor < DumbCrimeSteps.length; this.cursor++) {
      if (
        DumbCrimeSteps[this.cursor].nextLevel === -1 ||
        sleeve.skills[DumbCrimeSteps[this.cursor].stat] < DumbCrimeSteps[this.cursor].nextLevel
      )
        break;
    }
  }

  public process(sleeve: SleevePerson, task: SleeveTask): void {
    let step = DumbCrimeSteps[this.cursor];

    if (step.nextLevel !== -1 && sleeve.skills[step.stat] < step.nextLevel) {
      this.cursor++;
      step = DumbCrimeSteps[this.cursor];
    }

    if (task.type !== "CRIME" || task.crimeType !== step.crime) {
      this.ns.sleeve.setToCommitCrime(this.index, step.crime);
      this.logger.log("SleeveCommittingCrime", {
        index: this.index,
        crime: step.crime,
      });
    }
  }
}
