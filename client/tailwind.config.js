/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', '"General Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Cabinet Grotesk"', '"Instrument Sans"', 'sans-serif'],
        editorial: ['"Instrument Sans"', 'sans-serif'],
      },
      colors: {
        noir: '#030607',
        obsidian: '#1a1a1a',
        charcoal: '#1e1e1e',
        ash: '#757575',
        stoneWarm: '#ece9e7',
        cream: '#f6f4f1',
        sand: '#f1f1f1',
        linen: '#f3f3f3',
        framerBorder: '#dbdbdb',
        emeraldRent: '#26d18a',
        roseTag: '#fcb6c0',
        accentCrimson: '#d13648'
      },
      borderRadius: {
        'framer': '12px',
        'framer-lg': '16px',
        'framer-xl': '24px'
      },
      boxShadow: {
        'framer-sm': '0 2px 8px rgba(3, 6, 7, 0.04)',
        'framer-md': '0 8px 24px rgba(3, 6, 7, 0.08)',
        'framer-lg': '0 16px 40px rgba(3, 6, 7, 0.12)',
        'framer-drawer': '-10px 0 40px rgba(0, 0, 0, 0.15)'
      }
    },
  },
  plugins: [],
}
