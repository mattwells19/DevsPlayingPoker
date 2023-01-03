import mergeClassNames from "@/utils/mergeClassNames";
import { Component, JSX, splitProps } from "solid-js";
import styles from "./Metric.module.scss";

interface MetricProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
	label: string;
	value: string | number;
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
