/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FDF2F4',
          100: '#FCE7EB',
          200: '#F8C4CF',
          300: '#F39BAC',
          400: '#E96E88',
          500: '#D96B8C', // Warna utama brand HaidKu
          600: '#B84E6E',
          700: '#943852',
          800: '#752A3F',
          900: '#5C2232',
        },
        teal: {
          50: '#E8F6F3',
          100: '#D1EDE7',
          200: '#A3DCD0',
          300: '#6EC3B2',
          400: '#43A794',
          500: '#238B78', // Aksen edukasi/subur
          600: '#1B7162',
          700: '#165B4F',
          800: '#12483E',
          900: '#0E362F',
        },
        surface: '#FAFAF9',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

