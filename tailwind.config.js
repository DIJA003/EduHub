/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // scan all React files for classes
  ],
  theme: {
    extend: {
      colors: {
        edublue: "#2563EB",
      },
    },
  },
  plugins: [],
};
