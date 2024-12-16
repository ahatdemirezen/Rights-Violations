/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',  // Ana HTML dosyanız
    './src/**/*.{js,jsx,ts,tsx}',  // Tüm React bileşenlerinizi kapsar
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};