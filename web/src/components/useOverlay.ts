import { ComponentProps, createSignal } from "solid-js";

type UseOverlayResult = {
	dialogProps: ComponentProps<"dialog">;
	closeProps: ComponentProps<"button">;
	openProps: ComponentProps<"button">;
};

export default function useOverlay(
	overlayType: "modal" | "drawer",
): UseOverlayResult {
	const [overlayRef, setOverlayRef] = createSignal<HTMLDialogElement>();

	return {
		dialogProps: {
			ref: setOverlayRef,
			onClick: (e) => {
				const dialogDimensions = e.currentTarget.getBoundingClientRect();
				if (
					e.clientX < dialogDimensions.left ||
					e.clientX > dialogDimensions.right ||
					e.clientY < dialogDimensions.top ||
					e.clientY > dialogDimensions.bottom
				) {
					overlayRef()?.close();
				}
			},
		},
		closeProps: {
			onClick: () => overlayRef()?.close(),
		},
		openProps: {
			onClick: () => overlayRef()?.showModal(),
		},
	};
}
