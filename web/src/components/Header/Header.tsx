import { Component, JSXElement } from "solid-js";
import styles from "./Header.module.scss";

interface HeaderProps {
	children?: JSXElement;
	className?: string;
}

const Header: Component<HeaderProps> = ({ children, className = "" }) => {
	return (
		<header class={`${styles.header} ${className}`.trim()}>
			{children}
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
