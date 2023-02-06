import { Portal } from "solid-js/web";
import type { Component } from "solid-js";
import type { VoterClickAction } from "./VoterOptionsMenu";
import type { Voter } from "@/shared-types";
import { useIntl } from "@/i18n";

interface OptionConfirmationDialogProps {
	action: VoterClickAction;
	voter: Voter;
	onConfirm: () => void;
}

const OptionConfirmationDialog: Component<OptionConfirmationDialogProps> = (
	props,
) => {
	const intl = useIntl();

	const title = (() => {
		switch (props.action) {
			case "kickVoter":
			case "makeModerator":
				return intl.t(props.action);
			default:
				return null;
		}
	})();

	const description = (() => {
		switch (props.action) {
			case "kickVoter":
			case "makeModerator":
				return intl.t(`${props.action}Desc`, { name: props.voter.name });
			default:
				return null;
		}
	})();

	return (
		<Portal>
			<input
				type="checkbox"
				id={`confirmation-${props.action}`}
				class="modal-toggle"
			/>
			<label for={`confirmation-${props.action}`} class="modal cursor-pointer">
				{/* empty label prevents the background label from being triggered when clicking the modal content */}
				<label for="" class="modal-box">
					<h2 class="font-bold text-lg">{title}</h2>
					<p class="py-4">{description}</p>
					<div role="group" class="modal-action">
						<button class="btn btn-primary" onClick={props.onConfirm}>
							{intl.t("confirm")}
						</button>
						<label for={`confirmation-${props.action}`} class="btn btn-ghost">
							{intl.t("cancel")}
						</label>
					</div>
				</label>
			</label>
		</Portal>
	);
};

export default OptionConfirmationDialog;
