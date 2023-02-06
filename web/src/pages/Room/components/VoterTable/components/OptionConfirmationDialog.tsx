import { Portal } from "solid-js/web";
import type { Component, JSXElement } from "solid-js";
import type { VoterClickAction } from "./VoterOptionsMenu";
import type { Voter } from "@/shared-types";
import { useIntl } from "@/i18n";

interface OptionConfirmationDialogProps {
	id: `confirmation-${Voter["id"]}-${VoterClickAction}`;
	title: JSXElement;
	description: JSXElement;
	onConfirm: () => void;
}

const OptionConfirmationDialog: Component<OptionConfirmationDialogProps> = (
	props,
) => {
	const intl = useIntl();

	return (
		<Portal>
			<input type="checkbox" id={props.id} class="modal-toggle" />
			<label for={props.id} class="modal cursor-pointer">
				{/* empty label prevents the background label from being triggered when clicking the modal content */}
				<label for="" class="modal-box">
					<h2 class="font-bold text-lg">{props.title}</h2>
					<p class="py-4">{props.description}</p>
					<div role="group" class="modal-action">
						<button class="btn btn-primary" onClick={props.onConfirm}>
							{intl.t("confirm")}
						</button>
						<label for={props.id} class="btn btn-ghost">
							{intl.t("cancel")}
						</label>
					</div>
				</label>
			</label>
		</Portal>
	);
};

export default OptionConfirmationDialog;
