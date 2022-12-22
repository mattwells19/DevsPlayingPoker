import * as menu from "@zag-js/menu";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { Component, createMemo, createUniqueId } from "solid-js";
import type { Voter } from "@/shared-types";
import styles from "./VoterOptionsMenu.module.scss";
import { Portal } from "solid-js/web";

export type VoterClickAction = "makeModerator" | "kickVoter";

interface VoterOptionsMenuProps {
	voter: Voter;
	onVoterClick: (action: VoterClickAction, voter: Voter) => void;
}

const VoterOptionsMenu: Component<VoterOptionsMenuProps> = ({
	voter,
	onVoterClick,
}) => {
	const [state, send] = useMachine(
		menu.machine({
			id: createUniqueId(),
			onSelect(value) {
				onVoterClick(value as VoterClickAction, voter);
			},
			closeOnSelect: true,
			positioning: { placement: "right-start" },
		}),
	);

	const api = createMemo(() => menu.connect(state, send, normalizeProps));

	return (
		<>
			<button class={styles.voterName} {...api().triggerProps}>
				{voter.name}
			</button>
			<Portal>
				<div class={styles.voterActionMenu} {...api().positionerProps}>
					<ul {...api().contentProps}>
						<li {...api().getItemProps({ id: "makeModerator" })}>
							<span class={styles.itemIcon} aria-hidden>
								👑
							</span>
							Make moderator
						</li>
						<li {...api().getItemProps({ id: "kickVoter" })}>
							<span class={styles.itemIcon} aria-hidden>
								🥾
							</span>
							Kick voter
						</li>
					</ul>
				</div>
			</Portal>
		</>
	);
};

export default VoterOptionsMenu;
