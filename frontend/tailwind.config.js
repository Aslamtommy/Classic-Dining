module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sepia: {
          50: '#FCF9F3',
          100: '#F8F1E4',
          200: '#F1E3C9',
          300: '#E9D5AE',
          500: '#DAB978',
          700: '#C99D42',
          800: '#B38A3A',
          900: '#9C7732',
        },
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}

