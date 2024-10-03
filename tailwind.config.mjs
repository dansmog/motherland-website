/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        main: "#34B784",
        lightMain: "#F0F8F0",
      },
      fontFamily: {
        "body-regular": ["var(--body-regular)"],
        "body-medium": ["var(--body-medium)"],
        "body-black": ["var(--body-black)"],
        "body-light": ["var(--body-light)"],
        "body-bold": ["var(--body-bold)"],
      },
    },
  },
  plugins: [],
};
