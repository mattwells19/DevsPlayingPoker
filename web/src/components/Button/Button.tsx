import type { Component, JSX } from "solid-js";
import styles from "./Button.module.scss";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "solid" | "outline";
	href?: string;
}

const Button: Component<ButtonProps> = ({ variant = "solid", href, children, ...btnProps }) => {
	return href ? (
		<a class={styles[variant]} href={href}>
			{children}
		</a>
	) : (
		<button class={styles[variant]} {...btnProps}>
			{children}
		</button>
	);
};

export default Button;
