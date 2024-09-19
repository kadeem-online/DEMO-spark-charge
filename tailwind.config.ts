import { Config } from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{html, ts}"],
	theme: {
		extend: {
			colors: {
				azure: {
					50: "#E5F2FF",
					100: "#CCE5FF",
					200: "#99CCFF",
					300: "#66B2FF",
					400: "#3399FF",
					500: "#007FFF",
					600: "#0066CC",
					700: "#004C99",
					800: "#003366",
					900: "#001933",
					950: "#000D19",
				},
				gold: {
					50: "#FFFBE5",
					100: "#FFF7CC",
					200: "#FFEF99",
					300: "#FFE766",
					400: "#FFDF33",
					500: "#FFD700",
					600: "#CCAC00",
					700: "#998100",
					800: "#665600",
					900: "#332B00",
					950: "#191500",
				},
			},
		},
	},
	plugins: [],
};

export default config;
