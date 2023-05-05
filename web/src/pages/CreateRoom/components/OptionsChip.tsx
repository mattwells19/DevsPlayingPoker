import { Component, Show } from "solid-js";
import styles from "./OptionsChip.module.scss";
import Icon from "@/components/Icon";

interface OptionsChipProps {
	value: string;
	checked: boolean;
}

const OptionsChip: Component<OptionsChipProps> = (props) => {
	return (
		<label for={`option-${props.value}`} class={styles.option}>
			<input
				id={`option-${props.value}`}
				type="checkbox"
				name="options"
				value={props.value}
				checked={props.checked}
				title={props.value}
			/>
			<span aria-hidden="true">
				<svg
					width="70"
					viewBox="0 0 158 221"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						width="158"
						height="221"
						rx="8"
						class="fill-brand-whitish-lighter dark:fill-brand-navy-darker"
					/>
					<rect
						x="1"
						y="1"
						width="156"
						height="219"
						rx="7"
						class={styles.faceLayer}
					/>
					<Show
						fallback={
							<text
								x="79"
								y="135"
								fill="black"
								text-anchor="middle"
								font-weight="bold"
								class="fill-current text-[5rem]"
							>
								{props.value}
							</text>
						}
						when={props.value === "N/A"}
					>
						<Icon
							name="no-vote"
							aria-label="No-vote"
							width="80"
							height="80"
							x="39"
							y="69"
							transform-origin="center"
							fill="none"
						/>
					</Show>
				</svg>
			</span>
		</label>
	);
};

export default OptionsChip;
