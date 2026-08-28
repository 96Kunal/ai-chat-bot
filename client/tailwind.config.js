/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gemini: {
          bg: '#131314',
          sidebar: '#1e1f20',
          surface: '#1e1f20',
          'surface-hover': '#282a2c',
          'surface-active': '#333538',
          border: '#333538',
          'border-subtle': '#282a2c',
          blue: '#4285f4',
          purple: '#9b72cb',
          coral: '#d96570',
          amber: '#fbbc04',
          green: '#34a853',
          'text-primary': '#e3e3e3',
          'text-secondary': '#c4c7c5',
          'text-muted': '#8e918f',
        },
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Google Sans"', 'Outfit', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      backgroundImage: {
        'gemini-gradient': 'linear-gradient(74deg, #4285f4 0%, #9b72cb 25%, #d96570 50%, #d96570 60%, #9b72cb 75%, #4285f4 100%)',
        'gemini-btn': 'linear-gradient(135deg, #1e1f20 0%, #282a2c 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'gemini-pill': '0 4px 20px 0 rgba(0, 0, 0, 0.4)',
        'gemini-glow': '0 0 40px -10px rgba(66, 133, 244, 0.2)',
      },
    },
  },
  plugins: [],
}
