/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter"],
        poppins: ["Poppins"],
        'poppins-semiBold': ["Poppins-SemiBold"],
      },
      colors: {
        primary: "#4169E1",
        secondary: "#7291EE",
        background: "#FFFFFF",
        cardHeadingText: "#7291EE",
        muted: "#9EADD9",
        'muted-50': 'rgba(158, 173, 217, 0.5)',
      },
    },
  },
  plugins: [],
}

