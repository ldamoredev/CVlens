import { describe, expect, it } from "vitest";

import { beginAnalysisMetric, getAnalysisMetricsSnapshot } from "./metrics";

describe("analysis metrics", () => {
  it("records only coarse counts and durations", () => {
    const before = getAnalysisMetricsSnapshot();
    const metric = beginAnalysisMetric(1_000);
    expect(getAnalysisMetricsSnapshot().inFlight).toBe(before.inFlight + 1);

    metric.finish("success", 17_000);
    metric.finish("technical_error", 80_000);

    const after = getAnalysisMetricsSnapshot();
    expect(after.total).toBe(before.total + 1);
    expect(after.inFlight).toBe(before.inFlight);
    expect(after.outcomes.success).toBe(before.outcomes.success + 1);
    expect(after.outcomes.technical_error).toBe(before.outcomes.technical_error);
    expect(after.durationBuckets.under30Seconds).toBe(
      before.durationBuckets.under30Seconds + 1,
    );
    expect(Object.keys(after).sort()).toEqual([
      "durationBuckets",
      "inFlight",
      "outcomes",
      "total",
    ]);
  });
});
