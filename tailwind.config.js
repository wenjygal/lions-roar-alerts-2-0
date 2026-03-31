export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:         '#0d0d0d',
        card:       '#141414',
        'card-red': '#1a1010',
        'card-olive':'#1a1a08',
        border:     '#4a3a3a',
        accent:     '#e85d04',
        'accent-2': '#f48c06',
        muted:      '#a3a3a3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
