import mergeClassNames from "@/utils/mergeClassNames";
import { Link, useLocation } from "solid-app-router";
import { ParentComponent, Show } from "solid-js";
import styles from "./Header.module.scss";

interface HeaderProps {
	class?: string;
}

const Header: ParentComponent<HeaderProps> = (props) => {
	const location = useLocation();

	return (
		<header class={mergeClassNames(styles.header, props.class)}>
			<div class={styles.homeLinkContainer}>
				<Show when={location.pathname !== "/"}>
					<Link href="/">
						<span aria-hidden>🏠</span>
						Home
					</Link>
				</Show>
			</div>
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
