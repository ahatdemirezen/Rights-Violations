export default {
  content: [
    './index.html',  // Ana HTML dosyanız
    './src/**/*.{js,jsx,ts,tsx}',  // Tüm React bileşenlerinizi kapsar
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(109.6deg, rgb(17, 151, 147) 11.2%, rgb(154, 214, 212) 55.4%, rgb(255, 233, 171) 100.2%)',
      },
    },
  },
  plugins: [],
}