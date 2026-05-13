/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#0A1929',
          dark: '#0F2B3D',
          mid: '#1A3C5E',
          cyan: '#00D4FF',
          purple: '#7B2CBF',
        }
      }
    },
  },
  plugins: [],
}
