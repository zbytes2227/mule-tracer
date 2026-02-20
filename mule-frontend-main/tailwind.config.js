/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        bg: {
          0: '#060913',
          1: '#0b1120',
          2: '#121a2b',
        },
        accent: {
          400: '#56c7e8',
          500: '#76a0ff',
        },
        danger: {
          400: '#ff7a77',
          500: '#f29670',
        },
      },
      keyframes: {
        slideIn: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slideIn 0.68s cubic-bezier(0.16,1,0.3,1) forwards',
      },
    },
  },
  plugins: [],
}
