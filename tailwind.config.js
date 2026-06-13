export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2933',
        road: '#36454f',
        steel: '#64748b',
        lane: '#f4f7f9',
        signal: '#0f766e',
        amberline: '#d97706',
        paper: '#ffffff'
      },
      boxShadow: {
        panel: '0 12px 30px rgba(31, 41, 51, 0.08)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    }
  },
  plugins: []
};
