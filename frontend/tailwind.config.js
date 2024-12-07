/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#202329',   // Name for the first color
        blackv1: '#131313', // Name for the second color
        blacks1: '#1A1E22'
      },
    },
  },
  plugins: [],
}