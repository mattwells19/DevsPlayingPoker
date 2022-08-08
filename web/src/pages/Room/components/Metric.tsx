import type { Component, JSX } from "solid-js";

interface MetricProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
	label: string;
	value: string | number;
}

const Metric: Component<MetricProps> = ({ label, value, ...props }) => {
	return (
		<td {...props}>
			<dt>{label}</dt>
			<dd>{value}</dd>
		</td>
	);
};

export default Metric;
