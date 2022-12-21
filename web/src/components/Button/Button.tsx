import mergeClassNames from "@/utils/mergeClassNames";
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
	class: className,
	...anchorProps
}) => {
	return (
		<Link
			class={mergeClassNames(styles.button, styles[variant], className)}
			{...anchorProps}
		>
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
			{...merged}
			class={mergeClassNames(
				styles.button,
				styles[merged.variant],
				props.class,
				merged.loading ? "loading" : undefined,
			)}
			disabled={merged.disabled || merged.loading}
		>
			{merged.loading ? "Loading..." : merged.children}
		</button>
	);
};
