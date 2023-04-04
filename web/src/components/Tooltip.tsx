import { useMachine, normalizeProps } from "@zag-js/solid";
import {
	createUniqueId,
	createMemo,
	ParentComponent,
	Show,
	splitProps,
	mergeProps,
	JSXElement,
} from "solid-js";
import * as tooltip from "@zag-js/tooltip";
import { Portal } from "solid-js/web";

type TooltipProps = Omit<tooltip.Context, "id"> & {
	tip: JSXElement;
	// arrow styles are currently broken 😕
	// arrow?: boolean;
};

export const Tooltip: ParentComponent<TooltipProps> = (props) => {
	const [customProps, machineParts] = splitProps(props, [
		"children",
		"tip",
		// "arrow",
	]);
	const tooltipProps = mergeProps(
		{
			id: createUniqueId(),
			openDelay: 500,
			closeDelay: 300,
		},
		machineParts,
	);

	const [state, send] = useMachine(tooltip.machine(tooltipProps));

	const api = createMemo(() => tooltip.connect(state, send, normalizeProps));

	return (
		<>
			<button tabIndex="-1" {...api().triggerProps}>
				{customProps.children}
			</button>
			<Show when={api().isOpen}>
				<Portal>
					<div {...api().positionerProps}>
						{/* <Show when={customProps.arrow}>
							<div {...api().arrowProps}>
								<div {...api().arrowTipProps} />
							</div>
						</Show> */}
						<div class="bg-base-content text-base-100 px-4 py-2 rounded-lg transition-opacity animate-[fadeIn_200ms_ease-in-out]">
							<div {...api().contentProps} class="text-sm">
								{customProps.tip}
							</div>
						</div>
					</div>
				</Portal>
			</Show>
		</>
	);
};
