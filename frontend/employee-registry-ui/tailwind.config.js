/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#1111d4",
                "background-light": "#f6f6f8",
            },
            fontFamily: {
                "sans": ["Inter", "ui-sans-serif", "system-ui"],
                "display": ["Inter", "ui-sans-serif", "system-ui"],
            },
            boxShadow: {
                "primary": "0 4px 14px 0 rgba(17,17,212,0.15)",
            },
        },
    },
    plugins: [],
}
