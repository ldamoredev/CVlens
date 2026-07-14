import { getAnalysisMetricsSnapshot } from "../../server/observability/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(
    {
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
      analyses: getAnalysisMetricsSnapshot(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
