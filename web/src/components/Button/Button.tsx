import { Link } from "solid-app-router";
import type { Component, JSX } from "solid-js";
import styles from "./Button.module.scss";

interface ButtonLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
	variant?: "solid" | "outline";
	href: string;
}

export const ButtonLink: Component<ButtonLinkProps> = ({
	variant = "solid",
	children,
	...anchorProps
}) => {
	return (
		<Link class={styles[variant]} {...anchorProps}>
			{children}
		</Link>
	);
};

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "solid" | "outline";
	loading?: boolean;
}

export const Button: Component<ButtonProps> = ({
	variant = "solid",
	loading = false,
	children,
	...btnProps
}) => {
	return (
		<button
			class={`${styles[variant]} ${loading ? "loading" : ""}`}
			disabled={loading}
			{...btnProps}
		>
			{loading ? "Loading..." : children}
		</button>
	);
};
