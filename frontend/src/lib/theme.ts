export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "epl_theme";

/**
 * Reads the initial theme from localStorage (client-side) or strictly defaults to 'dark'.
 * System preference (prefers-color-scheme) is intentionally ignored to guarantee Dark Mode default.
 */
export function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light") {
      return "light";
    }
  } catch {
    // LocalStorage might be disabled or restricted in private browsing
  }
  return "dark";
}

/**
 * Sets the theme attribute on <html> and updates localStorage.
 */
export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage write errors
  }

  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }

  // Notify listeners (e.g., across components)
  window.dispatchEvent(
    new CustomEvent("epl-theme-changed", { detail: { theme } })
  );
}

/**
 * Toggles the current theme between 'dark' and 'light'.
 */
export function toggleTheme(): Theme {
  const current =
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("data-theme") as Theme) || getInitialTheme()
      : getInitialTheme();

  const nextTheme: Theme = current === "light" ? "dark" : "light";
  setTheme(nextTheme);
  return nextTheme;
}
