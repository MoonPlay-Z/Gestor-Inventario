/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        surface3: 'var(--surface3)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--info)',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.4)',
        glow: '0 0 0 1px rgba(99,102,241,0.15), 0 24px 48px rgba(15,23,42,0.24)',
      },
      borderRadius: {
        xl: '1.5rem',
      },
    },
  },
  plugins: [],
};

