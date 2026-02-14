/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "prometeo-black": "#0A0A0A",
        "prometeo-white": "#FFFFFF",
        "prometeo-red": "#E53935",
        "prometeo-redDark": "#8B0000",
        "prometeo-pink": "#F06292",
      },
    },
  },
  plugins: [],
};
