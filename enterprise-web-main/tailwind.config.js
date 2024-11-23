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
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'glow': {
          '0%, 100%': {
            'box-shadow': '0 0 20px 2px rgba(239, 68, 68, 0.3)',
          },
          '50%': {
            'box-shadow': '0 0 40px 8px rgba(239, 68, 68, 0.5)',
          },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'border-pulse': 'border-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple-1': 'ripple 6s linear infinite',
        'ripple-2': 'ripple 6s linear infinite 2s',
        'ripple-3': 'ripple 6s linear infinite 4s',
        'glow-effect': 'glow 3s ease-in-out infinite',
        'fade-up-1': 'fade-up 0.6s ease-out calc(0.2s * 1) forwards',
        'fade-up-2': 'fade-up 0.6s ease-out calc(0.2s * 2) forwards',
        'fade-up-3': 'fade-up 0.6s ease-out calc(0.2s * 3) forwards',
        'fade-up-4': 'fade-up 0.6s ease-out calc(0.2s * 4) forwards',
        'fade-up-5': 'fade-up 0.6s ease-out calc(0.2s * 5) forwards',
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
