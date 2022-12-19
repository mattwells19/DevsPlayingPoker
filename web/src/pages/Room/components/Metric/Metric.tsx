import mergeClassNames from "@/utils/mergeClassNames";
import type { Component, JSX } from "solid-js";
import styles from "./Metric.module.scss";

interface MetricProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
	label: string;
	value: string | number;
}

const Metric: Component<MetricProps> = ({
	label,
	value,
	class: className,
	...props
}) => {
	return (
		<td class={mergeClassNames(styles.metric, className)} {...props}>
			<dt>{label}</dt>
			<dd>{value}</dd>
		</td>
	);
};

export default Metric;
