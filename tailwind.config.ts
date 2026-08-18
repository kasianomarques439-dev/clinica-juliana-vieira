import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          bg: "#FBF9F6",
          ink: "#1E2A22",
          sage: "#5C7A63",
          "sage-dark": "#3E5843",
          clay: "#B98A6A",
          line: "#E4E0D8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        clinic: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
