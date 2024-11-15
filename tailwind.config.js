/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C590DD',
        secondary: '#C36AD1',
        accent: {
          base: '#7e22ce',
          hover: '#6F1EB6',
        },
        background: '#C36AD1',
      },
    },
  },
  plugins: [],
}
