/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:      { DEFAULT: '#1A6FA8', dark: '#0F4C75', light: '#D6EAF8', xlight: '#EBF5FB' },
        success:      { DEFAULT: '#27AE60', dark: '#1E8449', bg: '#D5F5E3' },
        danger:       { DEFAULT: '#E74C3C', bg: '#FADBD8' },
        warning:      { DEFAULT: '#F39C12', bg: '#FEF9E7' },
        surface:      '#FFFFFF',
        page:         '#EEF2F7',
        border:       '#D0E3F0',
        textMain:     '#1C2833',
        textSub:      '#566573',
        textMuted:    '#AAB7C4',
      },
      borderRadius: {
        sm: '8px', md: '12px', lg: '16px', xl: '24px',
      },
      boxShadow: {
        card:   '0 2px 10px rgba(15,76,117,0.08)',
        hover:  '0 6px 24px rgba(26,111,168,0.16)',
        button: '0 2px 8px rgba(26,111,168,0.25)',
      },
    }
  },
  plugins: [],
}
