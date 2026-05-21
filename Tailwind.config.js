/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:      '#0f0f14',
        surface:         '#1a1a24',
        'surface-light': '#242432',
        border:          'rgba(255,255,255,0.08)',
        primary:         '#6366f1',
        'primary-hover': '#818cf8',
        accent:          '#8b5cf6',
        success:         '#10b981',
        warning:         '#f59e0b',
        danger:          '#ef4444',
        muted:           '#71717a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in':        { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in':       { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'slide-up':       { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { from: { opacity: '0', transform: 'translateX(100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer:          { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      animation: {
        'fade-in':        'fade-in 0.2s ease-out both',
        'scale-in':       'scale-in 0.2s ease-out both',
        'slide-up':       'slide-up 0.3s ease-out both',
        'slide-in-right': 'slide-in-right 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}