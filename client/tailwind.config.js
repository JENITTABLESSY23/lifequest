/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quest: {
          gold: '#f59e0b',
          xp: '#8b5cf6',
          danger: '#ef4444',
          success: '#10b981',
          dark: '#0f172a',
          card: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
