import { useIntl } from "@/i18n";
import { Component } from "solid-js";
import { useRoom } from "@/pages/Room/RoomContext";
import type { Voter } from "@/shared-types";
import useOverlay from "@/components/useOverlay";
import Icon from "@/components/Icon";

interface KickVoterButtonProps {
	voter: Voter;
}

const KickVoterButton: Component<KickVoterButtonProps> = (props) => {
	const intl = useIntl();
	const room = useRoom();
	const modal = useOverlay("modal");

	const handleKickVoter = () => {
		room.dispatchEvent({
			event: "KickVoter",
			voterId: props.voter.id,
		});
	};

	return (
		<>
			<button
				type="button"
				class="w-8 h-8 p-1 text-sm rounded-full grid place-items-center transition-colors transition-opacity opacity-0 bg-opacity-10 text-brand-reddish bg-brand-reddish hover:(bg-opacity-30 bg-brand-reddish) dark:(text-brand-turquoise bg-brand-turquoise bg-opacity-10 hover:bg-opacity-30) group-hover:opacity-100 focus:opacity-100"
				aria-label={
					intl.t("kickVoter", { voterName: props.voter.name }) as string
				}
				title={intl.t("kickVoter", { voterName: props.voter.name }) as string}
				{...modal.openProps}
			>
				<Icon name="close" class="w-5 h-5" aria-label="Close modal." />
			</button>
			<dialog
				aria-labelledby="kick-voter-title"
				aria-describedby="kick-voter-desc"
				class="modal"
				{...modal.dialogProps}
			>
				<h2 id="kick-voter-title" class="font-bold text-lg text-left">
					<span aria-hidden="true" class="mr-1">
						🥾
					</span>
					{intl.t("kickVoter", { voterName: props.voter.name })}
				</h2>
				<button
					type="button"
					class="btn-icon rounded-full absolute top-1 right-1"
					aria-label={intl.t("cancel") as string}
					{...modal.closeProps}
				>
					<Icon name="close" class="w-6 h-6" aria-label="Close modal." />
				</button>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleKickVoter();
					}}
				>
					<p id="kick-voter-desc" class="mt-6">
						{intl.t("kickVoterDesc", { name: props.voter.name })}
					</p>
					<div role="group" class="flex justify-end gap-2 mt-10">
						<button type="submit" class="btn btn-sm">
							{intl.t("confirm")}
						</button>
						<button
							type="button"
							class="btn-ghost btn-sm"
							{...modal.closeProps}
						>
							{intl.t("cancel")}
						</button>
					</div>
				</form>
			</dialog>
		</>
	);
};

export default KickVoterButton;
