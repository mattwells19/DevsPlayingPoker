import mergeClassNames from "@/utils/mergeClassNames";
import { Component, JSX, JSXElement, splitProps } from "solid-js";
import styles from "./Metric.module.scss";

export interface MetricProps
	extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
	label: JSXElement;
	value: JSXElement;
}

const Metric: Component<MetricProps> = (props) => {
	const [customProps, tdProps] = splitProps(props, ["label", "value", "class"]);
	return (
		<td class={mergeClassNames(styles.metric, customProps.class)} {...tdProps}>
			<dt>{customProps.label}</dt>
			<dd>{customProps.value}</dd>
		</td>
	);
};

export default Metric;
