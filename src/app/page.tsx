import { CVLensApp } from "@/components/cvlens-app";
import { normalizePreviewState } from "@/lib/presentation-state";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const rawState = Array.isArray(params.state) ? params.state[0] : params.state;

  return <CVLensApp initialPreviewState={normalizePreviewState(rawState)} />;
}
