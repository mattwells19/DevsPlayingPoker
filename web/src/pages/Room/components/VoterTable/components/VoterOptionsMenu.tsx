import { Component, createUniqueId, JSXElement } from "solid-js";
import { Portal } from "solid-js/web";
import type { Voter } from "@/shared-types";
import { useIntl } from "@/i18n";

const voterActionOptions = ["makeModerator", "kickVoter"] as const;
export type VoterClickAction = (typeof voterActionOptions)[number];

interface VoterOptionsMenuItemProps {
	icon: string;
	title: JSXElement;
	description: JSXElement;
	onConfirmAction: () => void;
}

const VoterOptionsMenuItem: Component<VoterOptionsMenuItemProps> = (props) => {
	const intl = useIntl();
	const menuItemId = createUniqueId();

	return (
		<>
			<li class="flex gap-1 transition-colors">
				<label tabIndex="0" for={menuItemId}>
					<span aria-hidden="true">{props.icon}</span>
					{props.title}
				</label>
			</li>
			<Portal>
				<input type="checkbox" id={menuItemId} class="modal-toggle" />
				<label for={menuItemId} class="modal cursor-pointer">
					{/* empty label prevents the background label from being triggered when clicking the modal content */}
					<label for="" class="modal-box">
						<h2 class="font-bold text-lg">{props.title}</h2>
						<p class="py-4">{props.description}</p>
						<div role="group" class="modal-action">
							<button
								class="btn btn-primary"
								onClick={props.onConfirmAction}
								type="button"
							>
								{intl.t("confirm")}
							</button>
							<label for={menuItemId} class="btn btn-ghost">
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
	const intl = useIntl();

	return (
		<div class="dropdown dropdown-right">
			<label
				tabIndex="0"
				class="w-full overflow-hidden text-ellipsis text-left underline cursor-pointer"
			>
				{props.voter.name}
			</label>
			<ul class="menu bg-slate-100 dark:bg-base-100 rounded-md shadow-lg dropdown-content">
				<VoterOptionsMenuItem
					icon="👑"
					title={intl.t("makeModerator")}
					description={intl.t("makeModeratorDesc", { name: props.voter.name })}
					onConfirmAction={() => props.onOptionSelect("makeModerator")}
				/>
				<VoterOptionsMenuItem
					icon="🥾"
					title={intl.t("kickVoter")}
					description={intl.t("kickVoterDesc", { name: props.voter.name })}
					onConfirmAction={() => props.onOptionSelect("kickVoter")}
				/>
			</ul>
		</div>
	);
};

export default VoterOptionsMenu;
