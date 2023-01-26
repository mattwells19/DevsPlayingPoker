window.onload = () => {
	const savedPreference = localStorage.getItem("theme") ?? "system";

	if (savedPreference === "dark") {
		document.body.classList.add("dark");
		document.documentElement.setAttribute("data-theme", "dark");
	} else if (savedPreference === "light") {
		document.body.classList.remove("dark");
		document.documentElement.setAttribute("data-theme", "light");
	} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		document.body.classList.add("dark");
		document.documentElement.setAttribute("data-theme", "dark");
	} else {
		document.body.classList.remove("dark");
		document.documentElement.setAttribute("data-theme", "light");
	}
};
export {};
