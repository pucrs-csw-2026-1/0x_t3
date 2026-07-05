/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#b8336a",
        secondary: "#c490d1",
        tertiary: "#abdafc",
        neutral: "#e6fcff",
      },
      fontFamily: {
        sans: ["Public Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
      spacing: {
        sm: "8px",
        md: "16px",
      },
    },
  },
  plugins: [],
};
