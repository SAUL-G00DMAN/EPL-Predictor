import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        pl: {
          base: "var(--pl-base)",
          surface: "var(--pl-surface)",
          "surface-card": "var(--pl-surface-card)",
          border: "var(--pl-border)",
          "border-subtle": "var(--pl-border-subtle)",
          purple: "var(--pl-purple)",
          "purple-accent": "var(--pl-purple-accent)",
          "purple-highlight": "var(--pl-purple-highlight)",
          mint: "var(--pl-mint)",
          "mint-subtle": "var(--pl-mint-subtle)",
          berry: "var(--pl-berry)",
          "berry-light": "var(--pl-berry-light)",
          "berry-subtle": "var(--pl-berry-subtle)",
        },
      },
    },
  },
};

export default config;
