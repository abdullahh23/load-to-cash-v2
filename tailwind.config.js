export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',       // slate-900 (highly professional black)
        road: '#334155',      // slate-700
        steel: '#64748b',     // slate-500
        lane: '#f8fafc',      // slate-50 (clean greyish background)
        signal: '#0d9488',    // teal-600 (vibrant corporate primary)
        amberline: '#f59e0b', // amber-500 (premium warning/amber highlight)
        paper: '#ffffff'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        outfit: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 8px 30px rgb(15 23 42 / 0.04)',
        card: '0 4px 20px rgb(15 23 42 / 0.02)',
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(13, 148, 136, 0.3), 0 0 40px rgba(13, 148, 136, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(13, 148, 136, 0.5), 0 0 60px rgba(13, 148, 136, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    }
  },
  plugins: []
};
