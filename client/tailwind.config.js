/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: 'rgb(var(--primary))',
          600: 'rgb(var(--primary))',
          700: 'rgb(var(--primary-hover))',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      backgroundColor: {
        'theme-primary': 'rgb(var(--bg-primary))',
        'theme-secondary': 'rgb(var(--bg-secondary))',
        'theme-tertiary': 'rgb(var(--bg-tertiary))',
      },
      textColor: {
        'theme-primary': 'rgb(var(--text-primary))',
        'theme-secondary': 'rgb(var(--text-secondary))',
        'theme-tertiary': 'rgb(var(--text-tertiary))',
      },
      borderColor: {
        'theme': 'rgb(var(--border-color))',
      },
    },
  },
  plugins: [],
}
