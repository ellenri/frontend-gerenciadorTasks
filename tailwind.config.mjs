/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Primary: #6C8AE5 (Azul suave) - Para cabeçalhos, navegação e elementos principais
        primary: '#6C8AE5',
        'primary-dark': '#4A6FC4',
        'primary-light': '#8AA8F0',
        // Surface: #F9F1EC (Bege muito claro) - Para backgrounds e cards
        surface: '#F9F1EC',
        'surface-dark': '#E8D9CF',
        'surface-light': '#FCF8F5',
        // Highlight: #B5F966 (Verde limão) - Para detalhes, ícones e hover states
        highlight: '#B5F966',
        'highlight-dark': '#9FE04A',
        'highlight-light': '#C7FA8A',
        // Action: #D171EA (Roxo médio) - Para botões principais, alertas e ações importantes
        action: '#D171EA',
        'action-dark': '#B558D0',
        'action-light': '#DF94F0',
        // Secondary: #F7B53B (Laranja/amarelo) - Para tags, badges e informações secundárias
        secondary: '#F7B53B',
        'secondary-dark': '#E09F22',
        'secondary-light': '#F9C967',
        // Dark: #4C4C5F (Cinza arroxeado escuro) - Para textos e elementos escuros
        dark: '#4C4C5F',
        'dark-light': '#6B6B7E',
        'dark-lighter': '#8A8A9D',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
