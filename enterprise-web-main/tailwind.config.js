/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        'border-pulse': {
          '0%, 100%': { borderColor: '#ef4444' }, // red-500
          '50%': { borderColor: '#991b1b' }, // red-900
        },
      },
      animation: {
        'border-pulse': 'border-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        scrollbar: {
          track: '#1f2937', // gray-800
          thumb: '#4b5563', // gray-600
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
