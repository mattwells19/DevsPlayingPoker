import * as menu from "@zag-js/menu";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { Component, createMemo, createUniqueId } from "solid-js";
import type { Voter } from "@/shared-types";
import styles from "./VoterOptionsMenu.module.scss";
import { Portal } from "solid-js/web";
import { useIntl } from "@/i18n";

export type VoterClickAction = "makeModerator" | "kickVoter";

interface VoterOptionsMenuProps {
	voter: Voter;
	onVoterClick: (action: VoterClickAction, voter: Voter) => void;
}

const VoterOptionsMenu: Component<VoterOptionsMenuProps> = (props) => {
	const intl = useIntl();
	const [state, send] = useMachine(
		menu.machine({
			id: createUniqueId(),
			onSelect({ value }) {
				props.onVoterClick(value as VoterClickAction, props.voter);
			},
			closeOnSelect: true,
			positioning: { placement: "right-start" },
		}),
	);

	const api = createMemo(() => menu.connect(state, send, normalizeProps));

	return (
		<>
			<button class={styles.voterName} {...api().triggerProps}>
				{props.voter.name}
			</button>
			<Portal>
				<div class={styles.voterActionMenu} {...api().positionerProps}>
					<ul {...api().contentProps}>
						<li {...api().getItemProps({ id: "makeModerator" })}>
							<span class={styles.itemIcon} aria-hidden="true">
								👑
							</span>
							{intl.t("makeModerator")}
						</li>
						<li {...api().getItemProps({ id: "kickVoter" })}>
							<span class={styles.itemIcon} aria-hidden="true">
								🥾
							</span>
							{intl.t("kickVoter")}
						</li>
					</ul>
				</div>
			</Portal>
		</>
	);
};

export default VoterOptionsMenu;
