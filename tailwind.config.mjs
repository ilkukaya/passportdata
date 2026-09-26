/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  safelist: [{ pattern: /^(s|dot)-(visa_free|visa_on_arrival|eta|e_visa|visa_required|no_admission)$/ }],
  theme: { extend: {} },
  plugins: [],
};
