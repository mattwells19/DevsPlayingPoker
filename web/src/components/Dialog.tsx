import { useMachine, normalizeProps } from "@zag-js/solid";
import {
	createUniqueId,
	createMemo,
	ParentComponent,
	JSX,
	Show,
	useContext,
	createContext,
	Accessor,
	splitProps,
	mergeProps,
	createEffect,
} from "solid-js";
import * as dialog from "@zag-js/dialog";
import { Dynamic, Portal } from "solid-js/web";
import { Transition } from "solid-transition-group";

interface DialogProps extends Partial<dialog.Context> {
	isOpen?: boolean;
}

const DialogContext =
	createContext<Accessor<ReturnType<typeof dialog.connect>>>();
const useDialogContext = () => useContext(DialogContext)!;

const dialogDefaults: dialog.Context = {
	id: createUniqueId(),
	role: "alertdialog",
	// needed to avoid body.style.paddingRight content shift
	preventScroll: false,
};

export const Dialog: ParentComponent<DialogProps> = (props) => {
	const [peeps, customDialogProps] = splitProps(props, ["children"]);
	const dialogProps = mergeProps(dialogDefaults, customDialogProps);
	const [state, send] = useMachine(dialog.machine(dialogProps));

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

	createEffect(() => {
		if (props.isOpen === undefined) return;
		if (props.isOpen && !api().isOpen) {
			api().open();
		} else if (!props.isOpen && api().isOpen) {
			api().close();
		}
	});

	return (
		<DialogContext.Provider value={api}>
			{peeps.children}
		</DialogContext.Provider>
	);
};

export const DialogTrigger: ParentComponent<
	JSX.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
	const api = useDialogContext();
	const [customProps, btnProps] = splitProps(props, ["children"]);
	return (
		<button {...btnProps} {...api().triggerProps}>
			{customProps.children}
		</button>
	);
};

export const DrawerContent: ParentComponent = (props) => {
	const api = useDialogContext();

	return (
		<Portal>
			<Transition
				enterActiveClass="transition-opacity"
				exitActiveClass="transition-opacity"
				enterClass="opacity-0"
				exitToClass="opacity-0"
			>
				<Show when={api().isOpen}>
					<div
						{...api().backdropProps}
						class="fixed inset-0 bg-black/40 translate-x-f"
					/>
				</Show>
			</Transition>
			<Transition
				enterActiveClass="transition-transform"
				exitActiveClass="transition-transform"
				enterClass="translate-x-full"
				exitToClass="translate-x-full"
			>
				<Show when={api().isOpen}>
					<aside
						{...api().containerProps}
						class="w-full max-w-xs p-4 fixed top-0 right-0 h-full bg-brand-whitish dark:bg-brand-navy"
					>
						<div class="h-full" {...api().contentProps}>
							{props.children}
						</div>
					</aside>
				</Show>
			</Transition>
		</Portal>
	);
};

export const DialogContent: ParentComponent = (props) => {
	const api = useDialogContext();

	return (
		<Portal>
			<Transition
				enterActiveClass="transition-opacity"
				exitActiveClass="transition-opacity"
				enterClass="opacity-0"
				exitToClass="opacity-0"
			>
				<Show when={api().isOpen}>
					<div {...api().backdropProps} class="fixed inset-0 bg-black/40" />
				</Show>
			</Transition>
			<Transition
				enterActiveClass="transition-all"
				exitActiveClass="transition-all"
				enterClass="scale-95 opacity-0"
				exitToClass="scale-95 opacity-0"
			>
				<Show when={api().isOpen}>
					<div
						{...api().containerProps}
						class="fixed inset-0 w-full h-full grid place-items-center"
					>
						<div
							{...api().contentProps}
							class="relative bg-brand-whitish dark:(bg-brand-navy) py-4 px-6 rounded-md min-w-md"
						>
							{props.children}
						</div>
					</div>
				</Show>
			</Transition>
		</Portal>
	);
};

export const DialogTitle: ParentComponent<
	{
		as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	} & JSX.HTMLAttributes<HTMLHeadingElement>
> = (props) => {
	const api = useDialogContext();
	const [customProps, headingProps] = splitProps(props, ["as", "children"]);
	return (
		<Dynamic component={customProps.as} {...headingProps} {...api().titleProps}>
			{customProps.children}
		</Dynamic>
	);
};

type DialogDescriptionProps =
	| ({ as: "label" } & JSX.LabelHTMLAttributes<HTMLLabelElement>)
	| ({ as: "span" } & JSX.HTMLAttributes<HTMLSpanElement>)
	| ({ as: "p" } & JSX.HTMLAttributes<HTMLParagraphElement>);

export const DialogDescription: ParentComponent<DialogDescriptionProps> = (
	props,
) => {
	const api = useDialogContext();
	return (
		<Dynamic component={props.as} {...props} {...api().descriptionProps} />
	);
};

export const DialogCloseTrigger: ParentComponent<
	JSX.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
	const api = useDialogContext();
	const [customProps, btnProps] = splitProps(props, ["children"]);
	return (
		<button {...btnProps} {...api().closeTriggerProps}>
			{customProps.children}
		</button>
	);
};
