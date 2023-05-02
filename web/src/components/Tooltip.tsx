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
import { Transition } from "solid-transition-group";

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
			<button tabIndex="-1" class="bg-transparent" {...api().triggerProps}>
				{props.children}
			</button>
			<Portal>
				<Transition
					enterActiveClass="transition-opacity"
					exitActiveClass="transition-opacity"
					enterClass="opacity-0"
					exitToClass="opacity-0"
				>
					<Show when={api().isOpen}>
						<div
							{...api().positionerProps}
							class="arrow-w-10px arrow-bg-brand-navy dark:arrow-bg-brand-whitish"
						>
							<Show when={customProps.arrow}>
								<div {...api().arrowProps}>
									<div {...api().arrowTipProps} />
								</div>
							</Show>
							<div
								{...api().contentProps}
								class="bg-brand-navy text-brand-whitish dark:(bg-brand-whitish text-brand-navy) text-sm px-4 py-2 rounded-lg transition-opacity"
							>
								{customProps.tip}
							</div>
						</div>
					</Show>
				</Transition>
			</Portal>
		</>
	);
};

export const TooltipTrigger = () => {};
