// tailwind.config.js

module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // adjust this path to your source files
    ],
    theme: {
      extend: {
        animation: {
          'fade-in': 'fadeIn 0.5s ease-out',
          'fade-in-up': 'fadeInUp 0.6s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          fadeInUp: {
            '0%': { opacity: 0, transform: 'translateY(10px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        },
      },
    },
    plugins: [],
  }
  