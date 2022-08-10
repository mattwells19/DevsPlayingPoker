import { Link } from "solid-app-router";
import type { Component, JSX } from "solid-js";
import { mergeProps } from "solid-js";
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
		<Link class={`${styles.button} ${styles[variant]}`} {...anchorProps}>
			{children}
		</Link>
	);
};

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "solid" | "outline";
	loading?: boolean;
	disabled?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
	const merged = mergeProps(
		{
			variant: "solid",
			loading: false,
			disabled: false,
		},
		props,
	);

	return (
		<button
			class={`${styles.button} ${styles[merged.variant]} ${
				merged.loading ? "loading" : ""
			}`}
			disabled={merged.disabled || merged.loading}
			{...merged}
		>
			{merged.loading ? "Loading..." : merged.children}
		</button>
	);
};
