module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}", "app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
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
          600: "#D1AB5D",
          700: "#C99D42",
          800: "#B38A3A",
          900: "#9C7732",
          950: "#805F28",
        },
        gold: {
          100: "#FDF7E4",
          200: "#FAEDC4",
          300: "#F6E29F",
          400: "#F2D87A",
          500: "#EECE55",
          600: "#E5B72E",
          700: "#C99A1D",
          800: "#A47D18",
          900: "#7F6013",
        },
        bronze: {
          100: "#F6EDE5",
          200: "#EAD6C6",
          300: "#DDBEA7",
          400: "#D0A688",
          500: "#C38E69",
          600: "#B6764A",
          700: "#9A613D",
          800: "#7D4D31",
          900: "#613A25",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        cormorant: ["Cormorant Garamond", "serif"],
        lora: ["Lora", "serif"],
      },
      boxShadow: {
        elegant: "0 4px 20px -2px rgba(156, 119, 50, 0.15)",
        premium: "0 10px 30px -5px rgba(156, 119, 50, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.7s ease-in-out forwards",
        "slide-up": "slideUp 0.7s ease-out forwards",
        "slide-down": "slideDown 0.7s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "bounce-subtle": "bounceSubtle 2s infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "border-glow": "borderGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(156, 119, 50, 0.3)" },
          "50%": { borderColor: "rgba(156, 119, 50, 0.8)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #E5B72E 0%, #F2D87A 50%, #E5B72E 100%)",
        "sepia-gradient": "linear-gradient(135deg, #9C7732 0%, #DAB978 50%, #9C7732 100%)",
        marble: "url('/textures/marble.jpg')",
        paper: "url('/textures/paper.jpg')",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
