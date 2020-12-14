module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: 'Roboto',
        mono: 'Roboto Mono Light',
      },
      colors: {
        // uses root variables in tailwind.css
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        whiteAlt: 'var(--color-white-alt)',
        yearn: {
          blue: '#0657F9',
        },
      },
      keyframes: {
        flyingMenuEntering: {
          from: { transform: 'opacity-0 bg-blue-500 translate-y-1' },
          to: { transform: 'opacity-100 translate-y-0' },
        },
        flyingMenuLeaving: {
          from: { transform: 'opacity-100 translate-y-0' },
          to: { transform: 'opacity-0 translate-y-1' },
        },
      },
      animation: {
        flyingMenuEntering: 'flyingMenuEntering ease-out duration-300',
        flyingMenuLeaving: 'flyingMenuLeaving ease-in duration-150',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
