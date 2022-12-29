import type { Component } from "solid-js";
import styles from "./OptionCard.module.scss";

interface OptionCardProps {
	value: number;
	selected: boolean;
}

const OptionCard: Component<OptionCardProps> = (props) => {
	return (
		<span class={styles.optionContainer}>
			<input
				id={`option-${props.value}`}
				type="radio"
				name="selection"
				value={props.value}
				checked={props.selected}
				title={props.value > 0 ? props.value.toString() : "No-vote"}
			/>
			<label for={`option-${props.value}`}>
				<svg
					width="158"
					height="221"
					viewBox="0 0 158 221"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect width="158" height="221" rx="8" fill="white" />
					<rect x="1" y="1" width="156" height="219" rx="7" />
					<text x="15" y="208" fill="black" text-anchor="start">
						{props.value > 0 ? props.value : "No-vote"}
					</text>
					<text x="143" y="25" fill="black" text-anchor="end">
						{props.value > 0 ? props.value : "No-vote"}
					</text>
					{props.value > 0 ? (
						<text
							x="79"
							y="135"
							fill="black"
							text-anchor="middle"
							font-weight="bold"
							style="font-size: 5rem"
						>
							{props.value}
						</text>
					) : (
						<svg
							width="80"
							height="80"
							x="39"
							y="69"
							transform-origin="center"
							viewBox="0 0 100 100"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M23.5349 18.9717L81.612 77.0488M94 50C94 74.3005 74.3005 94 50 94C25.6995 94 6 74.3005 6 50C6 25.6995 25.6995 6 50 6C74.3005 6 94 25.6995 94 50Z"
								stroke="currentColor"
								stroke-width="11"
							/>
						</svg>
					)}
				</svg>
			</label>
		</span>
	);
};

export default OptionCard;
