/** @type {import('tailwindcss').Config} */
module.exports={
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary: 'rgb(7, 122, 41)'
      },
      fontFamily: {
        'helvetica': ['Helvetica', 'Arial', 'sans-serif']
      },
    },
  },
  plugins: [],
}

