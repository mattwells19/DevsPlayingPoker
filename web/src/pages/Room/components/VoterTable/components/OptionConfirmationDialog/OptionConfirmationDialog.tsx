import * as dialog from "@zag-js/dialog";
import { Portal } from "solid-js/web";
import { useMachine, normalizeProps } from "@zag-js/solid";
import { Component, createMemo, createUniqueId } from "solid-js";
import type { VoterClickAction } from "../VoterOptionsMenu";
import type { Voter } from "@/shared-types";
import styles from "./OptionConfirmationDialog.module.scss";
import Button from "@/components/Button";
import { useIntl } from "@/i18n";

interface OptionConfirmationDialogProps {
	action: VoterClickAction;
	voter: Voter;
	onConfirm: () => void;
	onCancel: () => void;
}

const OptionConfirmationDialog: Component<OptionConfirmationDialogProps> = (
	props,
) => {
	const t = useIntl();
	const [state, send] = useMachine(
		dialog.machine({
			id: createUniqueId(),
			role: "alertdialog",
			onClose: props.onCancel,
			defaultOpen: true,
			// needed to avoid body.style.paddingRight content shift
			preventScroll: false,
		}),
	);

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

	const title = (() => {
		switch (props.action) {
			case "kickVoter":
			case "makeModerator":
				return t(props.action);
			default:
				return null;
		}
	})();

	const description = (() => {
		switch (props.action) {
			case "kickVoter":
			case "makeModerator":
				return t(`${props.action}Desc`, { name: props.voter.name });
			default:
				return null;
		}
	})();

	return (
		<Portal>
			<div class={styles.optionConfirmationBackdrop} {...api().backdropProps} />
			<div class={styles.optionConfirmationContainer} {...api().containerProps}>
				<div {...api().contentProps}>
					<h2 {...api().titleProps}>{title}</h2>
					<p {...api().descriptionProps}>{description}</p>
					<Button variant="ghost" {...api().closeTriggerProps}>
						&#10005;
					</Button>
					<div role="group" onClick={() => api().close()}>
						<Button variant="solid" onClick={() => props.onConfirm()}>
							{t("confirm")}
						</Button>
						<Button variant="outline" onClick={() => props.onCancel()}>
							{t("cancel")}
						</Button>
					</div>
				</div>
			</div>
		</Portal>
	);
};

export default OptionConfirmationDialog;
