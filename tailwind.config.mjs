/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  darkMode: 'media',
  safelist: [{ pattern: /^(s|dot|bar)-(visa_free|visa_on_arrival|eta|e_visa|visa_required|no_admission)$/ }],
  theme: {
    extend: {
      colors: {
        paper: v('paper'),
        surface: v('surface'),
        sunken: v('sunken'),
        ink: v('ink'),
        muted: v('muted'),
        faint: v('faint'),
        line: v('line'),
        brand: v('brand'),
        'brand-ink': v('brand-ink'),
        stamp: v('stamp'),
        brass: v('brass'),
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      maxWidth: { page: '72rem' },
      boxShadow: {
        card: '0 1px 0 rgb(var(--line) / 1), 0 1px 3px rgb(20 26 38 / 0.04)',
        lift: '0 10px 30px -12px rgb(20 26 38 / 0.25)',
      },
    },
  },
  plugins: [],
};
