export const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
export const EXTRACTION_MAX_TOKENS = 6_000;

export function resolveAnthropicModel(configuredModel: string | undefined): string {
  const normalizedModel = configuredModel?.trim();
  return normalizedModel ? normalizedModel : DEFAULT_ANTHROPIC_MODEL;
}
