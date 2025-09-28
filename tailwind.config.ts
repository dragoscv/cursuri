import type { Config } from 'tailwindcss'
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AI Theme Colors
        'ai-primary': 'var(--ai-primary)',
        'ai-secondary': 'var(--ai-secondary)',
        'ai-accent': 'var(--ai-accent)',
        'ai-background': 'var(--ai-background)',
        'ai-foreground': 'var(--ai-foreground)',
        'ai-muted': 'var(--ai-muted)',
        'ai-card-bg': 'var(--ai-card-bg)',
        'ai-card-border': 'var(--ai-card-border)',

        // Success, Warning, Error colors
        'ai-success': 'var(--ai-success, #10b981)',
        'ai-warning': 'var(--ai-warning, #f59e0b)',
        'ai-error': 'var(--ai-error, #ef4444)',

        // Legacy support
        'primary': 'var(--ai-primary)',
        'secondary': 'var(--ai-secondary)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'ai-gradient': 'linear-gradient(to right, var(--ai-primary), var(--ai-secondary))',
        'ai-accent-gradient': 'linear-gradient(to right, var(--ai-secondary), var(--ai-accent))',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
export default config
