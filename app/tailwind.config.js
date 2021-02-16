// eslint-disable-next-line
const plugin = require('tailwindcss/plugin');

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    background: {
      yearn: {
        gradient: {
          blue:
            'linear-gradient(270deg, rgba(6, 87, 249, 5e-05) 0%, rgba(6, 87, 249, 0.250669) 100%), #000000',
          green:
            'linear-gradient(270deg, rgba(35, 209, 152, 3e-05) 0%, rgba(35, 209, 152, 0.150402) 100%), #000000',
          red:
            'linear-gradient(270deg, rgba(239, 30, 2, 5e-05) 0%, rgba(239, 30, 2, 0.250669) 100%), #000000',
          yellow:
            'linear-gradient(270deg, rgba(250, 191, 6, 5e-05) 0%, rgba(250, 191, 6, 0.250669) 100%), #000000',
        },
      },
    },

    borderColor: (theme) => ({
      ...theme('colors'),
      yearn: {
        blue: '#0D3A95',
        green: '#1C7C60',
        red: '#8D1C10',
        yellow: '#876C13',
      },
    }),
    extend: {
      fontFamily: {
        sans: 'Open Sans',
        mono: 'Open Sans',
      },
      colors: {
        // uses root variables in tailwind.css
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        whiteAlt: 'var(--color-white-alt)',
        yearn: {
          blue: '#006AE3',
          green: '#23D198',
          red: '#EF1E02',
          yellow: '#FABF06',
        },
      },

      boxShadow: {
        yearn: {
          blue: '#006AE3',
          green: '0px 0px 10px 2px rgba(35, 209, 152, 0.1)',
          red: '0px 0px 10px 2px rgba(239, 30, 2, 0.15)',
          yellow: '0px 0px 10px 2px rgba(239, 30, 2, 0.15)',
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
        marquee: {
          '0%': { transform: 'translate3d(calc(100%), 0, 0)' },
          '100%': { transform: 'translate3d(calc(-150%), 0, 0)' },
        },
      },
      animation: {
        flyingMenuEntering: 'flyingMenuEntering ease-out duration-300',
        flyingMenuLeaving: 'flyingMenuLeaving ease-in duration-150',
        marquee: 'marquee 15s linear infinite',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
