import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",

    // 👇 REQUIRED for better-auth-ui
    "./node_modules/@daveyplate/better-auth-ui/dist/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
