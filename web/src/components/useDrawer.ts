import { ComponentProps, createSignal } from "solid-js";

type UseDrawerResult = {
	drawerDialogProps: ComponentProps<"dialog">;
	closeDrawerProps: ComponentProps<"button">;
	openDrawerProps: ComponentProps<"button">;
};

export default function useDrawer(): UseDrawerResult {
	const [drawerRef, setDrawerRef] = createSignal<HTMLDialogElement>();

	return {
		drawerDialogProps: {
			ref: setDrawerRef,
			onAnimationEnd: () => {
				if (drawerRef()?.classList.contains("drawer-opening")) {
					drawerRef()?.classList.remove("drawer-opening");
				}

				if (drawerRef()?.classList.contains("drawer-closing")) {
					drawerRef()?.classList.remove("drawer-closing");
					drawerRef()?.close();
				}
			},
		},
		closeDrawerProps: {
			onClick: () => drawerRef()?.classList.add("drawer-closing"),
		},
		openDrawerProps: {
			onClick: () => {
				drawerRef()?.classList.add("drawer-opening");
				drawerRef()?.showModal();
			},
		},
	};
}
