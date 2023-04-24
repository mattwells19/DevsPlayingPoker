import { Component, JSXElement, splitProps } from "solid-js";
import {
	RangeSlider,
	RangeSliderControl,
	RangeSliderLabel,
	RangeSliderThumb,
	RangeSliderTrack,
	RangeSliderProps,
} from "@/components/RangeSlider";

const NumberOfOptionsSlider: Component<
	RangeSliderProps & { label: JSXElement }
> = (props) => {
	const [customProps, rangeSliderProps] = splitProps(props, ["label"]);
	return (
		<RangeSlider
			minStepsBetweenThumbs={1}
			{...rangeSliderProps}
			class="w-full form-control mt-2"
		>
			<RangeSliderLabel>{customProps.label}</RangeSliderLabel>
			<RangeSliderControl>
				<RangeSliderTrack />
				<RangeSliderThumb index={0} />
				<RangeSliderThumb index={1} />
			</RangeSliderControl>
		</RangeSlider>
	);
};

export default NumberOfOptionsSlider;
