import * as rangeSlider from "@zag-js/range-slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createMemo, Component, JSXElement } from "solid-js";
import type { NumberRange } from "../../CreateRoom.schemas";
import styles from "./RangeSlider.module.scss";

interface RangeSliderProps {
	id: string;
	name: string;
	label: JSXElement;
	value?: NumberRange;
	min?: number;
	max?: number;
	step?: number;
}

const RangeSlider: Component<RangeSliderProps> = (props) => {
	const [state, send] = useMachine(
		rangeSlider.machine({
			...props,
			minStepsBetweenThumbs: 1,
		}),
	);
	const api = createMemo(() =>
		rangeSlider.connect(state, send, normalizeProps),
	);

	return (
		<div class={styles.slider} {...api().rootProps}>
			<div>
				<label class="label" {...api().labelProps}>
					{props.label}
				</label>
			</div>
			<div {...api().controlProps}>
				<div class="bg-base-content bg-opacity-10" {...api().trackProps}>
					<div class="bg-primary" {...api().rangeProps} />
				</div>
				<div
					class="bg-white border-2 border-primary dark:bg-base-300"
					{...api().getThumbProps(0)}
				>
					<input {...api().getHiddenInputProps(0)} />
				</div>
				<div
					class="bg-white border-2 border-primary dark:bg-base-300"
					{...api().getThumbProps(1)}
				>
					<input {...api().getHiddenInputProps(1)} />
				</div>
			</div>
		</div>
	);
};

export default RangeSlider;
