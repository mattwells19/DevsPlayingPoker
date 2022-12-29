import mergeClassNames from "@/utils/mergeClassNames";
import type { ParentComponent } from "solid-js";
import styles from "./Header.module.scss";

interface HeaderProps {
	class?: string;
}

const Header: ParentComponent<HeaderProps> = (props) => {
	return (
		<header class={mergeClassNames(styles.header, props.class)}>
			{props.children}
			<button
				class={styles.themeBtn}
				type="button"
				onClick={() => {
					document.body.classList.toggle("dark");
					localStorage.setItem(
						"theme",
						document.body.classList.contains("dark") ? "dark" : "light",
					);
				}}
			>
				Toggle Theme
			</button>
		</header>
	);
};

export default Header;
