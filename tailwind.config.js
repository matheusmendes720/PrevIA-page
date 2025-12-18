/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        // Base font-size is 15px (set in globals.css), so rem values scale accordingly
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 11.25px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 13.125px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 15px - base size
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 16.875px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 18.75px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 22.5px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 28.125px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 33.75px
        '5xl': ['3rem', { lineHeight: '1' }],           // 45px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 56.25px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 67.5px
        '8xl': ['6rem', { lineHeight: '1' }],           // 90px
        '9xl': ['8rem', { lineHeight: '1' }],           // 120px
      },
      colors: {
        'brand-blue': '#0a192f',
        'brand-light-navy': '#172a45',
        'brand-navy': '#112240',
        'brand-lightest-slate': '#ccd6f6',
        'brand-light-slate': '#a8b2d1',
        'brand-slate': '#8892b0',
        'brand-cyan': '#64ffda',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};

