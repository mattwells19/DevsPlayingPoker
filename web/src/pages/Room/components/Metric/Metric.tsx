import type { Component, JSX } from "solid-js";
import styles from "./Metric.module.scss";

interface MetricProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
	label: string;
	value: string | number;
}

const Metric: Component<MetricProps> = ({ label, value, ...props }) => {
	return (
		<td class={styles.metric} {...props}>
			<dt>{label}</dt>
			<dd>{value}</dd>
		</td>
	);
};

export default Metric;
