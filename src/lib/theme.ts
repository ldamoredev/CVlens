export const THEME_STORAGE_KEY = "cvlens-theme";

export type Theme = "dark" | "light";

export function resolveThemePreference(
  storedTheme: string | null,
  prefersLight: boolean,
): Theme {
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return prefersLight ? "light" : "dark";
}

/** Runs before hydration so the initial paint already uses the chosen theme. */
export const themeInitScript = `
try {
  var storedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
  var theme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = theme;
} catch (_) {
  document.documentElement.dataset.theme = "dark";
}
`;
