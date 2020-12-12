module.exports = {
  plugins: [
    // eslint-disable-next-line
    require('tailwindcss')('./app/tailwind.config.js'),
    // eslint-disable-next-line
    require('autoprefixer'),
  ],
};
