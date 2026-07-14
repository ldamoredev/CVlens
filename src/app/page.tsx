import { CVLensApp } from "@/components/cvlens-app";
import { normalizePreviewState } from "@/lib/presentation-state";
import { previewStatesEnabled } from "@/lib/preview-state-policy";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const rawState = previewStatesEnabled(
    process.env.NODE_ENV,
    process.env.CVLENS_ENABLE_PREVIEW_STATES,
  )
    ? Array.isArray(params.state)
      ? params.state[0]
      : params.state
    : undefined;

  return <CVLensApp initialPreviewState={normalizePreviewState(rawState)} />;
}
