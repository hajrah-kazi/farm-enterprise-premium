/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10B981", // Emerald 500
        secondary: "#3B82F6", // Blue 500
        dark: "#111827", // Gray 900
        light: "#F3F4F6", // Gray 100
        accent: "#8B5CF6", // Violet 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
