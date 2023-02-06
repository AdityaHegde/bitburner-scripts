/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./web/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
}
