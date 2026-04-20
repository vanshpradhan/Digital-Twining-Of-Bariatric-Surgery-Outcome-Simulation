/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Medical-grade color palette
        background: "#0a0a0a",
        foreground: "#fafafa",
        primary: {
          DEFAULT: "#1e3a5f",
          light: "#2d5a8f",
          dark: "#0f1f35",
          foreground: "#fafafa"
        },
        secondary: {
          DEFAULT: "#c0c0c0",
          foreground: "#0a0a0a"
        },
        accent: {
          DEFAULT: "#3b82f6",
          foreground: "#fafafa"
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#a0a0a0"
        },
        card: {
          DEFAULT: "#111111",
          foreground: "#fafafa"
        },
        border: "#2a2a2a",
        // Status colors
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
        // Stress visualization colors
        stress: {
          low: "#22c55e",
          medium: "#f59e0b",
          high: "#ef4444"
        }
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(59, 130, 246, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
