module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        // uses root variables in tailwind.css
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        whiteAlt: 'var(--color-white-alt)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
