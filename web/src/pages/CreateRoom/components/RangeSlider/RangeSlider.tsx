import * as rangeSlider from "@zag-js/range-slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createMemo, Component } from "solid-js";
import type { NumberRange } from "../../CreateRoom.schemas";
import styles from "./RangeSlider.module.scss";

interface RangeSliderProps {
	id: string;
	name: string;
	label: string;
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
				<label {...api().labelProps}>{props.label}</label>
			</div>
			<div {...api().controlProps}>
				<div {...api().trackProps}>
					<div {...api().rangeProps} />
				</div>
				<div {...api().getThumbProps(0)}>
					<input {...api().getHiddenInputProps(0)} />
				</div>
				<div {...api().getThumbProps(1)}>
					<input {...api().getHiddenInputProps(1)} />
				</div>
			</div>
		</div>
	);
};

export default RangeSlider;
