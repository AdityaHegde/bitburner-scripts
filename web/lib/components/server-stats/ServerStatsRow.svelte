<script lang="ts">
  import type { ServerStats } from "$scripts/hack/helpers/hacksMetadata";
  import { ShorthandNotationSchema } from "$lib/utils/shorthand-notation.js";

  export let serverStats: ServerStats;
</script>

<tr>
  <td class="text-center">{serverStats.server}</td>
  <td class="text-center">{serverStats.security.toFixed(2)}({serverStats.minSecurity.toFixed(2)})</td>
  <td class="text-center">
    <span>{ShorthandNotationSchema.usd.convert(serverStats.money)}</span
    >/<span>{ShorthandNotationSchema.usd.convert(serverStats.maxMoney)}</span>
  </td>
  <td class="text-center">{serverStats.rates.map(rate => rate.toFixed(2)).join("|")}</td>
  <td class="text-center">{serverStats.times.map(
    time => ShorthandNotationSchema.time.convert(time)
  ).join("|")}</td>
  <td class="text-center">{serverStats.securities.map(sec => sec.toFixed(2)).join("|")}</td>
</tr>