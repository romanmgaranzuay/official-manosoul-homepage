import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        // Body / Content Font
        sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        // Header / Display Font
        serif: ['"Cormorant Garamond"', ...defaultTheme.fontFamily.serif],
        // Technical / Metadata Font
        mono: ['"Space Grotesk"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
