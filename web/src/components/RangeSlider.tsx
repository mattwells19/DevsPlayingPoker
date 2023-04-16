import * as rangeSlider from "@zag-js/range-slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import {
	Accessor,
	createContext,
	createUniqueId,
	useContext,
	createMemo,
	ParentComponent,
	Component,
	splitProps,
	mergeProps,
	JSX,
} from "solid-js";

const RangeSliderContext =
	createContext<Accessor<ReturnType<typeof rangeSlider.connect>>>();
const useRangeSliderContext = () => useContext(RangeSliderContext)!;

const rangeSliderDefaults: rangeSlider.Context = {
	id: createUniqueId(),
};

export type RangeSliderProps = Omit<rangeSlider.Context, "id"> & {
	class?: string;
};

export const RangeSlider: ParentComponent<RangeSliderProps> = (props) => {
	const [rootProps, customRangeSliderProps] = splitProps(props, [
		"children",
		"class",
	]);
	const rangeSliderProps = mergeProps(
		rangeSliderDefaults,
		customRangeSliderProps,
	);
	const [state, send] = useMachine(rangeSlider.machine(rangeSliderProps));
	const api = createMemo(() =>
		rangeSlider.connect(state, send, normalizeProps),
	);

	return (
		<RangeSliderContext.Provider value={api}>
			<div {...api().rootProps} class={rootProps.class}>
				{rootProps.children}
			</div>
		</RangeSliderContext.Provider>
	);
};

export const RangeSliderLabel: ParentComponent<
	JSX.LabelHTMLAttributes<HTMLLabelElement>
> = (props) => {
	const api = useRangeSliderContext();
	const [customProps, labelProps] = splitProps(props, ["children"]);
	return (
		<label {...labelProps} {...api().labelProps}>
			{customProps.children}
		</label>
	);
};

export const RangeSliderControl: ParentComponent = (props) => {
	const api = useRangeSliderContext();
	return (
		<div
			{...api().controlProps}
			class="flex items-center justify-center relative my-2 h-5"
		>
			{props.children}
		</div>
	);
};

export const RangeSliderTrack: Component = () => {
	const api = useRangeSliderContext();
	return (
		<div
			class="bg-brand-navy bg-opacity-10 h-2 w-full rounded-full"
			{...api().trackProps}
		>
			<div
				class="bg-brand-reddish dark:(bg-brand-turquoise) rounded-full h-full disabled:(bg-black bg-opacity-40)"
				{...api().rangeProps}
			/>
		</div>
	);
};

export const RangeSliderThumb: Component<{ index: number }> = (props) => {
	const api = useRangeSliderContext();
	return (
		<div
			class="bg-brand-reddish dark:(bg-brand-turquoise) w-5 h-5 rounded-full"
			{...api().getThumbProps(props.index)}
		>
			<input {...api().getHiddenInputProps(props.index)} />
		</div>
	);
};
