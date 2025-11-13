/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FlowSight Brand Colors
        'midnight-blue': '#0A1931',
        'electric-cyan': '#00FFFF',
        'light-gray': '#F0F0F0',
        // Additional colors for charts and UI
        'lime-green': '#00FF00',
        'sentinel-red': '#FF0000',
      },
      fontFamily: {
        'mono': ['Space Mono', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

