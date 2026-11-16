import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9efff",
          200: "#b9e2ff",
          300: "#86cefe",
          400: "#4cb3fa",
          500: "#2193f3",
          600: "#0c75d7",
          700: "#0b5db1",
          800: "#0d4e90",
          900: "#104276",
          950: "#0a2a4e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
