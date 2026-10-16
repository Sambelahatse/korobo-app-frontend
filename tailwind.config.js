/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          dark:   '#3d6b2a',
          mid:    '#4e8a35',
          light:  '#6aad46',
          pale:   '#e8f2e3',
          pale2:  '#d4e8cb',
          header: '#5a7a4a',
        },
        dark: {
          bg:     '#1e1e1e',
          darker: '#161616',
        },
        nav:     '#f0f5ec',
        sidebar: '#f5f7f3',
      },
      fontFamily: {
        syne: ['Inter', 'Open Sans', 'Lato', 'sans-serif'],
        dm:   ['Inter', 'Open Sans', 'Lato', 'sans-serif'],
        sans: ['Inter', 'Open Sans', 'Lato', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up':  'fadeUp 0.8s ease forwards',
        'fade-in':  'fadeIn 1.2s ease forwards',
      },
    },
  },
  plugins: [],
}
