/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#f8fafc',
          dark: '#0b0f19',
        },
        surface: {
          light: '#ffffff',
          dark: '#131b2e',
        },
        border: {
          light: '#e2e8f0',
          dark: '#1e293b',
        },
        provenance: {
          reported: '#059669', // Emerald
          ai: '#7c3aed',       // Violet
          annotation: '#d97706', // Amber
          asserted: '#0284c7', // Sky
        },
        relation: {
          supports: '#10b981',
          contradicts: '#ef4444',
          qualifies: '#f59e0b',
          extends: '#3b82f6',
          discusses: '#8b5cf6',
          duplicates: '#6b7280',
          unrelated: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
