import { Component, JSX, JSXElement, splitProps } from "solid-js";

export interface MetricProps
	extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
	label: JSXElement;
	value: JSXElement;
}

const Metric: Component<MetricProps> = (props) => {
	const [customProps, tdProps] = splitProps(props, ["label", "value", "class"]);
	return (
		<td class={customProps.class} {...tdProps}>
			<dl>
				<dt class="font-normal text-sm uppercase">{customProps.label}</dt>
				<dd class="text-3xl">{customProps.value}</dd>
			</dl>
		</td>
	);
};

export default Metric;
