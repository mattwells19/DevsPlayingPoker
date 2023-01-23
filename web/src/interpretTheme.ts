window.onload = () => {
	const savedPreference = localStorage.getItem("theme");

	if (savedPreference && savedPreference === "dark") {
		document.body.classList.add("dark");
	} else if (
		!savedPreference &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
	) {
		document.body.classList.add("dark");
		localStorage.setItem("theme", "dark");
	}
};
export {};
