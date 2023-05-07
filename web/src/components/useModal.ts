import { ComponentProps, createSignal } from "solid-js";

type UseModalResult = {
	modalDialogProps: ComponentProps<"dialog">;
	closeModalProps: ComponentProps<"button">;
	openModalProps: ComponentProps<"button">;
};

export default function useModal(): UseModalResult {
	const [modalRef, setModalRef] = createSignal<HTMLDialogElement>();

	return {
		modalDialogProps: {
			ref: setModalRef,
			onAnimationEnd: () => {
				if (modalRef()?.classList.contains("modal-opening")) {
					modalRef()?.classList.remove("modal-opening");
				}

				if (modalRef()?.classList.contains("modal-closing")) {
					modalRef()?.classList.remove("modal-closing");
					modalRef()?.close();
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
					modalRef()?.classList.add("modal-closing");
				}
			},
		},
		closeModalProps: {
			onClick: () => modalRef()?.classList.add("modal-closing"),
		},
		openModalProps: {
			onClick: () => {
				modalRef()?.classList.add("modal-opening");
				modalRef()?.showModal();
			},
		},
	};
}
