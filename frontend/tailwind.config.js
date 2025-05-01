/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
        sepia: {
          50: "#FCF9F3",
          100: "#F8F1E4",
          200: "#F1E3C9",
          300: "#E9D5AE",
          400: "#E2C794",
          500: "#DAB978",
          600: "#C9A05D", // Slightly darker, more premium
          700: "#B38A3A", // Richer brown
          800: "#8F6E2E", // Deeper brown
          900: "#6B5222", // Dark rich brown
          950: "#4A3918", // Very dark brown for text
        },
        gold: {
          100: "#FDF7E4",
          200: "#FAEDC4",
          300: "#F6E29F",
          400: "#F2D87A",
          500: "#E5C55A", // Less yellow, more gold
          600: "#D4B13D", // Richer gold
          700: "#B3942F", // Deeper gold
          800: "#8C7324", // Dark gold
          900: "#6A571C", // Very dark gold
        },
        bronze: {
          100: "#F6EDE5",
          200: "#EAD6C6",
          300: "#DDBEA7",
          400: "#D0A688",
          500: "#C38E69",
          600: "#A97550", // Richer bronze
          700: "#8A5F41", // Deeper bronze
          800: "#6B4A32", // Dark bronze
          900: "#4D3624", // Very dark bronze
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
      boxShadow: {
        elegant: "0 4px 20px -2px rgba(107, 82, 34, 0.15)",
        premium: "0 10px 30px -5px rgba(107, 82, 34, 0.2)",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
