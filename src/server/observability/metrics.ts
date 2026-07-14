export type AnalysisOutcome =
  | "insufficient"
  | "invalid_request"
  | "invalid_upload"
  | "provider_error"
  | "rate_limited"
  | "success"
  | "technical_error"
  | "timeout";

export interface AnalysisMetricsSnapshot {
  inFlight: number;
  outcomes: Record<AnalysisOutcome, number>;
  total: number;
  durationBuckets: {
    under15Seconds: number;
    under30Seconds: number;
    under60Seconds: number;
    over60Seconds: number;
  };
}

function createMetrics(): AnalysisMetricsSnapshot {
  return {
    total: 0,
    inFlight: 0,
    outcomes: {
      insufficient: 0,
      invalid_request: 0,
      invalid_upload: 0,
      provider_error: 0,
      rate_limited: 0,
      success: 0,
      technical_error: 0,
      timeout: 0,
    },
    durationBuckets: {
      under15Seconds: 0,
      under30Seconds: 0,
      under60Seconds: 0,
      over60Seconds: 0,
    },
  };
}

const metricsGlobal = globalThis as typeof globalThis & {
  __cvlensAnalysisMetrics?: AnalysisMetricsSnapshot;
};

function metrics(): AnalysisMetricsSnapshot {
  metricsGlobal.__cvlensAnalysisMetrics ??= createMetrics();
  return metricsGlobal.__cvlensAnalysisMetrics;
}

export function beginAnalysisMetric(startedAt = Date.now()): {
  finish: (outcome: AnalysisOutcome, finishedAt?: number) => void;
} {
  const state = metrics();
  state.total += 1;
  state.inFlight += 1;
  let finished = false;

  return {
    finish(outcome, finishedAt = Date.now()) {
      if (finished) return;
      finished = true;
      state.inFlight = Math.max(0, state.inFlight - 1);
      state.outcomes[outcome] += 1;

      const duration = Math.max(0, finishedAt - startedAt);
      if (duration < 15_000) state.durationBuckets.under15Seconds += 1;
      else if (duration < 30_000) state.durationBuckets.under30Seconds += 1;
      else if (duration < 60_000) state.durationBuckets.under60Seconds += 1;
      else state.durationBuckets.over60Seconds += 1;
    },
  };
}

export function getAnalysisMetricsSnapshot(): AnalysisMetricsSnapshot {
  const state = metrics();
  return {
    total: state.total,
    inFlight: state.inFlight,
    outcomes: { ...state.outcomes },
    durationBuckets: { ...state.durationBuckets },
  };
}
