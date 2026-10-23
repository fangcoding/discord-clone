import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Discord dark theme palette
        "d-serverbar": "#1e1f22",
        "d-sidebar": "#2b2d31",
        "d-chat": "#313338",
        "d-chatinput": "#383a40",
        "d-userpanel": "#232428",
        "d-hover": "#35373c",
        "d-active": "#404249",
        "d-divider": "#3f4147",
        "d-blurple": "#5865f2",
        "d-blurple-hover": "#4752c4",
        "d-green": "#23a55a",
        "d-yellow": "#f0b232",
        "d-red": "#f23f43",
        "d-text": "#dbdee1",
        "d-muted": "#949ba4",
        "d-header": "#f2f3f5",
      },
      keyframes: {
        "badge-float": {
          "0%, 100%": { transform: "translateY(0)", filter: "brightness(1)" },
          "50%": { transform: "translateY(-2px)", filter: "brightness(1.4)" },
        },
      },
      animation: {
        "badge-float": "badge-float 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
