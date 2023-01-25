import { BatchOperationBuffer, BatchOperationStartBuffer, HackGroupSize } from "$src/constants";
import type { ClusterData } from "$src/servers/clusters/data/clusterData";
import type { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import type { HackJob } from "$src/servers/hack/hackJob";
import type { Target } from "$src/servers/target";
import type { Logger } from "$src/utils/logger/logger";
import { ShorthandNotationSchema } from "$src/utils/shorthand-notation";

export class ClusterRunner {
  public constructor(
    protected readonly logger: Logger,
    protected readonly clusterData: ClusterData,
    protected readonly target: Target,
    protected readonly hackJob: HackJob,
  ) {}

  public async runCluster() {
    const [period, startOffsets, endOffsets] = this.hackJob.getPeriodAndOffsets(
      this.target.resource,
    );
    this.log(period);
    this.target.hackJob.setEnd(endOffsets, this.clusterData.groups.length);

    for (let groupIdx = 0; groupIdx < this.clusterData.groups.length; groupIdx++) {
      await this.startGroup(
        this.clusterData.groups[groupIdx],
        groupIdx,
        period,
        startOffsets,
        endOffsets,
      );
    }
  }

  public async runClusterGroup(group: ClusterGroup) {
    const groupIdx = this.clusterData.groups.indexOf(group);
    if (groupIdx === -1) return;

    const [period, startOffsets, endOffsets] = this.hackJob.getPeriodAndOffsets(
      this.target.resource,
    );
    this.log(period);
    this.target.hackJob.setEnd(endOffsets, this.clusterData.groups.length);
    return this.startGroup(group, groupIdx, period, startOffsets, endOffsets);
  }

  protected async startGroup(
    group: ClusterGroup,
    groupIdx: number,
    period: number,
    startOffsets: Array<number>,
    endOffsets: Array<number>,
  ) {
    for (let oprnIdx = 0; oprnIdx < this.hackJob.operations.length; oprnIdx++) {
      if (oprnIdx === this.hackJob.hackIdx && groupIdx % HackGroupSize !== 0) continue;

      const offset = Date.now() + BatchOperationStartBuffer + groupIdx * BatchOperationBuffer;

      for (const resource of group.resources[oprnIdx]) {
        await resource.startAssignment(
          this.target.resource.server,
          this.hackJob.countMulti[oprnIdx],
          offset + startOffsets[oprnIdx],
          offset + endOffsets[oprnIdx],
          period / this.hackJob.countMulti[oprnIdx],
          oprnIdx,
          groupIdx,
        );
      }
    }
  }

  private log(period: number) {
    this.logger.info("SendingAssignments", {
      target: this.target.resource.server,
      money: `${ShorthandNotationSchema.usd.convert(
        this.target.resource.money,
      )}/${ShorthandNotationSchema.usd.convert(this.target.resource.maxMoney)}`,
      period: ShorthandNotationSchema.time.convert(period),
      security: `${Math.ceil(this.target.resource.security)}(${this.target.resource.minSecurity})`,
      threads: this.target.hackJob.threads,
      runs: this.clusterData.runs,
      percent: this.target.hackJob.percent,
    });
  }
}
