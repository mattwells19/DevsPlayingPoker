import { useMachine, normalizeProps } from "@zag-js/solid";
import {
	createUniqueId,
	createMemo,
	Show,
	splitProps,
	mergeProps,
	type JSXElement,
	type Component,
	type JSX,
} from "solid-js";
import * as tooltip from "@zag-js/tooltip";
import { Portal } from "solid-js/web";

type TooltipProps = Omit<tooltip.Context, "id"> & {
	tip: JSXElement;
	arrow?: boolean;
	children: JSX.Element;
};

export const Tooltip: Component<TooltipProps> = (props) => {
	const [customProps, machineParts] = splitProps(props, [
		"children",
		"tip",
		"arrow",
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
				{props.children}
			</button>
			<Show when={api().isOpen}>
				<Portal>
					<div
						{...api().positionerProps}
						class="animate-[fadeIn_200ms_ease-in-out]"
						style={{
							"--arrow-size": "10px",
							"--arrow-background": "hsl(var(--bc))",
						}}
					>
						<Show when={customProps.arrow}>
							<div {...api().arrowProps}>
								<div {...api().arrowTipProps} />
							</div>
						</Show>
						<div
							{...api().contentProps}
							class="bg-base-content text-base-100 text-sm px-4 py-2 rounded-lg transition-opacity"
						>
							{customProps.tip}
						</div>
					</div>
				</Portal>
			</Show>
		</>
	);
};

export const TooltipTrigger = () => {};
