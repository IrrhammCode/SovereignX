import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sovereign: {
          navy: '#0A1628',
          blue: '#002D62',
          green: '#00A36C',
          glow: '#00FF88',
          surface: '#0D2137',
          glass: 'rgba(0, 45, 98, 0.55)',
        },
        brand: {
          primary: '#00A36C',
          secondary: '#002D62',
          accent: '#00FF88',
          dark: '#0A1628',
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        vault: '0 0 40px rgba(0, 163, 108, 0.15)',
        glow: '0 0 30px rgba(0, 255, 136, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
