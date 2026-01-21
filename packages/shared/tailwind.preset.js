/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // アプリ識別カラー
        host: {
          DEFAULT: '#1a1a2e',
          light: '#2d2d4a',
        },
        remote1: {
          DEFAULT: '#3498db',
          light: '#5dade2',
        },
        remote2: {
          DEFAULT: '#e74c3c',
          light: '#ec7063',
        },
        // 共有カラー
        badge: {
          props: '#2ecc71',
          event: '#9b59b6',
          zustand: '#f39c12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
