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
				<ul class="menu bg-slate-100 dark:bg-base-100 rounded-md shadow-lg dropdown-content">
					<li class="flex gap-1 transition-colors">
						<label
							tabIndex="0"
							for={`confirmation-${props.voter.id}-makeModerator`}
						>
							<span aria-hidden="true">👑</span>
							{intl.t("makeModerator")}
						</label>
					</li>
					<li class="flex gap-1 transition-colors">
						<label
							tabIndex="0"
							for={`confirmation-${props.voter.id}-kickVoter`}
						>
							<span aria-hidden="true">🥾</span>
							{intl.t("kickVoter")}
						</label>
					</li>
				</ul>
			</div>
			<OptionConfirmationDialog
				id={`confirmation-${props.voter.id}-makeModerator`}
				title={intl.t("makeModerator")}
				description={intl.t("makeModeratorDesc", { name: props.voter.name })}
				onConfirm={() => props.onOptionSelect("makeModerator", props.voter)}
			/>
			<OptionConfirmationDialog
				id={`confirmation-${props.voter.id}-kickVoter`}
				title={intl.t("kickVoter")}
				description={intl.t("kickVoterDesc", { name: props.voter.name })}
				onConfirm={() => props.onOptionSelect("kickVoter", props.voter)}
			/>
		</>
	);
};

export default VoterOptionsMenu;
