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
} from "solid-js";
import * as dialog from "@zag-js/dialog";
import { Dynamic, Portal } from "solid-js/web";

const DialogContext =
	createContext<Accessor<ReturnType<typeof dialog.connect>>>();
const useDialogContext = () => useContext(DialogContext)!;

const dialogDefaults: dialog.Context = {
	id: createUniqueId(),
	role: "alertdialog",
	// needed to avoid body.style.paddingRight content shift
	preventScroll: false,
};

export const Dialog: ParentComponent<Partial<dialog.Context>> = (props) => {
	const [peeps, customDialogProps] = splitProps(props, ["children"]);
	const dialogProps = mergeProps(dialogDefaults, customDialogProps);
	const [state, send] = useMachine(dialog.machine(dialogProps));

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

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

export const DialogContent: ParentComponent = (props) => {
	const api = useDialogContext();
	return (
		<Show when={api().isOpen}>
			<Portal>
				<div {...api().backdropProps} class="fixed inset-0 bg-black/40" />
				<div
					{...api().containerProps}
					class="fixed inset-0 w-full h-full grid place-items-center"
				>
					<div {...api().contentProps} class="modal-box">
						{props.children}
					</div>
				</div>
			</Portal>
		</Show>
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
