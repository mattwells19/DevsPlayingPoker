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

	const openingClass = () => `${overlayType}-opening`;
	const closingClass = () => `${overlayType}-closing`;

	return {
		dialogProps: {
			ref: setOverlayRef,
			onAnimationEnd: () => {
				if (overlayRef()?.classList.contains(openingClass())) {
					overlayRef()?.classList.remove(openingClass());
				}

				if (overlayRef()?.classList.contains(closingClass())) {
					overlayRef()?.classList.remove(closingClass());
					overlayRef()?.close();
				}
			},
			onClick: (e) => {
				const dialogDimensions = e.currentTarget.getBoundingClientRect();
				if (
					e.clientX < dialogDimensions.left ||
					e.clientX > dialogDimensions.right ||
					e.clientY < dialogDimensions.top ||
					e.clientY > dialogDimensions.bottom
				) {
					overlayRef()?.classList.add(closingClass());
				}
			},
			onKeyDown: (e) => {
				if (e.key === "Escape") {
					e.preventDefault();
					overlayRef()?.classList.add(closingClass());
				}
			},
		},
		closeProps: {
			onClick: () => overlayRef()?.classList.add(closingClass()),
		},
		openProps: {
			onClick: () => {
				overlayRef()?.classList.add(openingClass());
				overlayRef()?.showModal();
			},
		},
	};
}
