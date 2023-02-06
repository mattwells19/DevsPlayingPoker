import type { Component } from "solid-js";
import type { Voter } from "@/shared-types";
import { useIntl } from "@/i18n";
import OptionConfirmationDialog from "./OptionConfirmationDialog";

export type VoterClickAction = "makeModerator" | "kickVoter";

interface VoterOptionsMenuProps {
	voter: Voter;
	onOptionSelect: (action: VoterClickAction, voter: Voter) => void;
}

const VoterOptionsMenu: Component<VoterOptionsMenuProps> = (props) => {
	const intl = useIntl();

	return (
		<>
			<div class="dropdown dropdown-right">
				<button class="w-full overflow-hidden text-ellipsis text-left underline">
					{props.voter.name}
				</button>
				<ul class="menu bg-slate-100 dark:bg-base-300 rounded-box shadow-lg dropdown-content">
					<li class="flex gap-1 transition-colors">
						<label tabIndex="0" for="confirmation-makeModerator">
							<span aria-hidden="true">👑</span>
							{intl.t("makeModerator")}
						</label>
					</li>
					<li class="flex gap-1 transition-colors">
						<label tabIndex="0" for="confirmation-kickVoter">
							<span aria-hidden="true">🥾</span>
							{intl.t("kickVoter")}
						</label>
					</li>
				</ul>
			</div>
			<OptionConfirmationDialog
				action="makeModerator"
				onConfirm={() => props.onOptionSelect("makeModerator", props.voter)}
				voter={props.voter}
			/>
			<OptionConfirmationDialog
				action="kickVoter"
				onConfirm={() => props.onOptionSelect("kickVoter", props.voter)}
				voter={props.voter}
			/>
		</>
	);
};

export default VoterOptionsMenu;
