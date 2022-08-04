import type { Component } from "solid-js";
import styles from "./OptionCard.module.scss";

interface OptionCardProps {
	value: number;
	selected: boolean;
}

const OptionCard: Component<OptionCardProps> = ({ value, selected }) => {
	return (
		<span class={styles.optionContainer}>
			<input
				id={`option-${value}`}
				type="radio"
				name="selection"
				value={value}
				checked={selected}
			/>
			<label for={`option-${value}`}>
				<svg
					width="158"
					height="221"
					viewBox="0 0 158 221"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect width="158" height="221" rx="8" fill="white" />
					<rect
						x="1"
						y="1"
						width="156"
						height="219"
						rx="7"
						stroke="black"
						stroke-opacity="0.25"
						stroke-width="2"
					/>
					<text
						x="10%"
						y="92%"
						text-anchor="start"
						alignment-baseline="baseline"
						fill="black"
					>
						{value}
					</text>
					<text
						x="90%"
						y="8%"
						text-anchor="end"
						alignment-baseline="hanging"
						fill="black"
					>
						{value}
					</text>
					<text
						x="50%"
						y="52%"
						text-anchor="middle"
						alignment-baseline="middle"
						fill="black"
						font-weight="bold"
						style="font-size: 5rem"
					>
						{value}
					</text>
				</svg>
			</label>
		</span>
	);
};

export default OptionCard;
