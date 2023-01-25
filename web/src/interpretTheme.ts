window.onload = () => {
	const savedPreference = localStorage.getItem("theme") ?? "system";

	if (savedPreference === "dark") {
		document.body.classList.add("dark");
	} else if (savedPreference === "light") {
		document.body.classList.remove("dark");
	} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		document.body.classList.add("dark");
	} else {
		document.body.classList.remove("dark");
	}
};
export {};
