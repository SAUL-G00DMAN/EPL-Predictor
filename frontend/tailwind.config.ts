import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        pl: {
          base: "var(--pl-base)",
          surface: "var(--pl-surface)",
          "surface-card": "var(--pl-surface-card)",
          "surface-elevated": "var(--pl-surface-elevated)",
          border: "var(--pl-border)",
          "border-subtle": "var(--pl-border-subtle)",
          "text-primary": "var(--pl-text-primary)",
          "text-secondary": "var(--pl-text-secondary)",
          "text-muted": "var(--pl-text-muted)",
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
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", '[data-theme="light"] &');
    }),
  ],
};

export default config;
