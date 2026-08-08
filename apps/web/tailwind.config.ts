/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sovereign: {
          blue: '#002D62',
          green: '#00A36C',
          navy: '#0A1628',
          vault: '#0D2137',
          glow: '#00FF88',
        },
      },
      boxShadow: {
        vault: '0 0 40px rgba(0, 163, 108, 0.15)',
        node: '0 0 20px rgba(0, 163, 108, 0.35)',
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        ringSpin: 'ringSpin 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        ringSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
