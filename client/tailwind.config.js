/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f3f7',
          100: '#dce4ed',
          200: '#bcc9d9',
          300: '#94a9c2',
          400: '#7d9bb8',
          500: '#6a8aaa',
          600: '#5a7799',
          700: '#4d657f',
          800: '#435468',
          900: '#3a4758',
        },
        page: '#0e1116',
        panel: '#12161d',
        border: '#2a3140',
        'border-light': '#232a37',
        text: '#ece9e2',
        'text-secondary': '#8a8577',
        accent: {
          blue: '#7d9bb8',
          ocre: '#c2a24b',
          sage: '#8fae8b',
          terracotta: '#b87d6e',
        },
      },
    },
  },
  plugins: [],
};
