import { Component, For } from "solid-js";
import { Portal } from "solid-js/web";
import type { Voter } from "@/shared-types";
import { useIntl } from "@/i18n";

const voterActionOptions = ["makeModerator", "kickVoter"] as const;
export type VoterClickAction = (typeof voterActionOptions)[number];

interface VoterOptionsMenuItemProps {
	action: VoterClickAction;
	voter: Voter;
	onConfirmAction: () => void;
}

const VoterOptionsMenuItem: Component<VoterOptionsMenuItemProps> = (props) => {
	const intl = useIntl();
	const menuItemId = () => `confirmation-${props.voter.id}-${props.action}`;

	return (
		<>
			<li class="flex gap-1 transition-colors">
				<label tabIndex="0" for={menuItemId()}>
					<span aria-hidden="true">👑</span>
					{intl.t(props.action)}
				</label>
			</li>
			<Portal>
				<input type="checkbox" id={menuItemId()} class="modal-toggle" />
				<label for={menuItemId()} class="modal cursor-pointer">
					{/* empty label prevents the background label from being triggered when clicking the modal content */}
					<label for="" class="modal-box">
						<h2 class="font-bold text-lg">{intl.t(props.action)}</h2>
						<p class="py-4">
							{intl.t(`${props.action}Desc`, { name: props.voter.name })}
						</p>
						<div role="group" class="modal-action">
							<button
								class="btn btn-primary"
								onClick={props.onConfirmAction}
								type="button"
							>
								{intl.t("confirm")}
							</button>
							<label for={menuItemId()} class="btn btn-ghost">
								{intl.t("cancel")}
							</label>
						</div>
					</label>
				</label>
			</Portal>
		</>
	);
};

interface VoterOptionsMenuProps {
	voter: Voter;
	onOptionSelect: (action: VoterClickAction) => void;
}

const VoterOptionsMenu: Component<VoterOptionsMenuProps> = (props) => {
	return (
		<div class="dropdown dropdown-right">
			<button class="w-full overflow-hidden text-ellipsis text-left underline">
				{props.voter.name}
			</button>
			<ul class="menu bg-slate-100 dark:bg-base-100 rounded-md shadow-lg dropdown-content">
				<For each={voterActionOptions}>
					{(action) => (
						<VoterOptionsMenuItem
							action={action}
							voter={props.voter}
							onConfirmAction={() => props.onOptionSelect(action)}
						/>
					)}
				</For>
			</ul>
		</div>
	);
};

export default VoterOptionsMenu;
