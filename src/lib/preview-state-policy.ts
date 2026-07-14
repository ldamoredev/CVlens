export function previewStatesEnabled(
  nodeEnvironment: string | undefined,
  configuredValue: string | undefined,
): boolean {
  return nodeEnvironment !== "production" || configuredValue === "true";
}
