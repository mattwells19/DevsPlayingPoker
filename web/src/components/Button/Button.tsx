import mergeClassNames from "@/utils/mergeClassNames";
import { Link } from "solid-app-router";
import { Component, JSX, splitProps } from "solid-js";
import { mergeProps } from "solid-js";
import styles from "./Button.module.scss";

interface ButtonLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
	variant?: "solid" | "outline";
	href: string;
}

export const ButtonLink: Component<ButtonLinkProps> = (props) => {
	const mergedProps = mergeProps({ variant: "solid" }, props);
	const [customProps, anchorProps] = splitProps(mergedProps, [
		"variant",
		"children",
		"class",
	]);

	return (
		<Link
			class={mergeClassNames(
				styles.button,
				styles[customProps.variant],
				customProps.class,
			)}
			{...anchorProps}
		>
			{customProps.children}
		</Link>
	);
};

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "solid" | "outline" | "ghost";
	loading?: boolean;
	disabled?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
	const mergedProps = mergeProps(
		{
			variant: "solid",
			loading: false,
			disabled: false,
		},
		props,
	);
	const [customProps, btnProps] = splitProps(mergedProps, [
		"variant",
		"loading",
		"class",
		"disabled",
		"children",
	]);

	return (
		<button
			{...btnProps}
			class={mergeClassNames(
				styles.button,
				styles[customProps.variant],
				customProps.class,
				customProps.loading ? "loading" : undefined,
			)}
			disabled={customProps.disabled || customProps.loading}
		>
			{customProps.loading ? "Loading..." : customProps.children}
		</button>
	);
};
