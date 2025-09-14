/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'reddit-orange': '#FF4500',
        'reddit-blue': '#0079D3',
        'reddit-gray': '#D7DADC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'meme-gradient': 'linear-gradient(135deg, #ff4500 0%, #ff6b35 50%, #ff8c42 100%)',
        'market-gradient': 'linear-gradient(135deg, #1a1a1b 0%, #2d2d30 50%, #1a1a1b 100%)',
      },
    },
  },
  plugins: [],
}
