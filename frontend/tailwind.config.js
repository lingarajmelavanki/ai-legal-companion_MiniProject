/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F3EBDD",
          light: "#FAF6F0",
          card: "#FBF8F3",
          surface: "#FFFFFF",
        },
        forest: {
          DEFAULT: "#173D32",
          deep: "#0F2A22",
          light: "#315D49",
          muted: "#E2EAE6",
        },
        copper: {
          DEFAULT: "#B77B50",
          hover: "#9E643B",
          light: "#EBDCCF",
          dark: "#7A4A28",
        },
        charcoal: {
          DEFAULT: "#252B29",
          soft: "#363D3B",
          deep: "#1A1E1D",
        },
        ink: {
          muted: "#77766E",
          faint: "#A5A49D",
          border: "#D8D0C3",
          borderStrong: "#B8AE9F",
        },
        editorial: {
          riskHigh: "#992E2E",
          riskHighBg: "#FDF1F1",
          riskHighBorder: "#E8B2B2",
          riskMed: "#9E641B",
          riskMedBg: "#FEF7EE",
          riskMedBorder: "#E8CBA1",
          riskLow: "#1E5E45",
          riskLowBg: "#EEF7F2",
          riskLowBorder: "#A3D4BE",
        }
      },
      fontFamily: {
        serif: ["Newsreader", "Playfair Display", "Georgia", "Cambria", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        'paper-sm': '0 1px 2px rgba(37, 43, 41, 0.05)',
        'paper-md': '0 4px 12px rgba(37, 43, 41, 0.06)',
        'paper-lg': '0 10px 24px rgba(37, 43, 41, 0.08)',
        'paper-inset': 'inset 0 1px 3px rgba(37, 43, 41, 0.05)',
      }
    },
  },
  plugins: [],
}
