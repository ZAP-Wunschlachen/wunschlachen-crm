import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts,js}',
    './layers/**/*.{vue,ts,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        'dental-blue': {
          1: '#0d1a5c',
          0: '#172774',
          '-1': '#3d4a8e',
          '-2': '#7079a8',
          '-3': '#a3a9c6',
          '-4': '#cacdde',
          '-5': '#e5e6ee',
          '-6': '#f6f6f8',
        },
        'power-red': {
          0: '#f4297e',
          '-1': '#f76ba5',
          '-2': '#faa3c5',
          '-3': '#fdd4e3',
          '-4': '#feeaf2',
        },
        'success-green': {
          0: '#03dac6',
          '-1': '#f3fdfc',
        },
        'error-red': {
          0: '#b00020',
          '-1': '#e3a6b1',
        },
        'warning': {
          0: '#f0d85a',
          '-1': '#fff8db',
        },
        'soft-concrete': {
          5: '#1e1e1e',
          4: '#3a3a3b',
          3: '#636365',
          2: '#c1c1c2',
          1: '#dddde0',
          0: '#eeeef0',
          '-1': '#f5f5f7',
          '-2': '#fbfbfc',
        },
        crm: {
          sidebar: '#0d1a5c',
          accent: '#172774',
          'accent-light': '#3d4a8e',
        },
      },
      fontSize: {
        'xxs': '10px',
      },
    },
  },
  plugins: [],
} satisfies Config
