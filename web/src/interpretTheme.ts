window.onload = () => {
	const savedPreference = localStorage.getItem("theme") ?? "system";

	if (savedPreference === "dark") {
		document.documentElement.classList.add("dark");
	} else if (savedPreference === "light") {
		document.documentElement.classList.remove("dark");
	} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
};
export {};
