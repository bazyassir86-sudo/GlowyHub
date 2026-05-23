/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#05050a",
        panel: "#0c0d16",
        line: "rgba(255,255,255,0.1)",
        neon: {
          purple: "#a855f7",
          blue: "#38bdf8",
          pink: "#fb3bc8",
          green: "#22c55e"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(168, 85, 247, 0.24)",
        blueGlow: "0 0 34px rgba(56, 189, 248, 0.2)"
      }
    }
  },
  plugins: []
};
