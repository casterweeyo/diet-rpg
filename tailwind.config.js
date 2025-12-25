import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#13ec5b",
        "primary-dark": "#0fa640",
        "background-light": "#f6f8f6",
        "background-dark": "#102216",
        "surface-dark": "#172d20",
        "surface-card": "#1e3a2a",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"]
      },
      borderRadius: { "DEFAULT": "1rem", "lg": "1.5rem", "xl": "2rem", "2xl": "2.5rem" },
    },
  },
  plugins: [
    daisyui,
  ],
}