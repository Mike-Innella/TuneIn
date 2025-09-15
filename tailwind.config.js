/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
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
        // Original shadcn/ui tokens (keep for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // App semantic design tokens
        app: {
          DEFAULT: 'var(--app-bg)',
          bg: 'var(--app-bg)',
          surface: 'var(--app-surface)',
          surface2: 'var(--app-surface2)',
          border: 'var(--app-border)',
          text: 'var(--app-text)',
          muted: 'var(--app-text-muted)',
          primary: 'var(--app-primary)',
          'primary-fg': 'var(--app-primary-fg)',
        },
        // Legacy tokens for compatibility
        bg: {
          DEFAULT: 'hsl(0 0% 100%)',
          subtle: 'hsl(220 14% 97%)',
          hover: 'hsl(220 14% 95%)',
        },
        text: {
          DEFAULT: 'hsl(222 47% 11%)',
          muted: 'hsl(215 16% 46%)',
          soft: 'hsl(215 15% 56%)',
          onGradient: 'hsl(210 40% 98%)',
        },
        brand: {
          50:  '#eef6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          green: '#22c55e',
          yellow: '#f59e0b',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        cursive: ['Dancing Script', 'Brush Script MT', 'Lucida Handwriting', 'cursive'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 6px 20px rgba(17, 24, 39, 0.08)',
        cardHover: '0 12px 28px rgba(17, 24, 39, 0.12)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
