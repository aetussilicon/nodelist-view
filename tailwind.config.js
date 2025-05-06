/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#121212',
          secondary: '#1E1E1E',
        },
        text: {
          primary: '#E0E0E0',
          secondary: '#A0A0A0',
        },
        border: '#2A2A2A',
        accent: {
          DEFAULT: '#8A2BE2',
          hover: '#9B30FF',
        },
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FFC107',
      },
      screens: {
        xs: '320px'
      }
    },

  },
  plugins: [],
}

