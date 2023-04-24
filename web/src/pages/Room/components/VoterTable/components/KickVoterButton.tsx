import { useIntl } from "@/i18n";
import { Component } from "solid-js";
import { useRoom } from "@/pages/Room/RoomContext";
import type { Voter } from "@/shared-types";
import {
	Dialog,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/Dialog";

interface KickVoterButtonProps {
	voter: Voter;
}

const KickVoterButton: Component<KickVoterButtonProps> = (props) => {
	const intl = useIntl();
	const room = useRoom();

	const handleKickVoter = () => {
		room.dispatchEvent({
			event: "KickVoter",
			voterId: props.voter.id,
		});
	};

	return (
		<Dialog>
			<DialogTrigger
				class="w-8 h-8 p-1 text-sm rounded-full transition-colors transition-opacity opacity-0 bg-opacity-10 text-brand-reddish bg-brand-reddish hover:(bg-opacity-30 bg-brand-reddish) dark:(text-brand-turquoise bg-brand-turquoise bg-opacity-10 hover:bg-opacity-30) group-hover:opacity-100"
				aria-label={
					intl.t("kickVoter", { voterName: props.voter.name }) as string
				}
				title={intl.t("kickVoter", { voterName: props.voter.name }) as string}
			>
				&#10005;
			</DialogTrigger>
			<DialogContent>
				<DialogTitle as="h2" class="font-bold text-lg text-left">
					<span aria-hidden="true" class="mr-1">
						🥾
					</span>
					{intl.t("kickVoter", { voterName: props.voter.name })}
				</DialogTitle>
				<DialogCloseTrigger
					class="btn-ghost rounded-full absolute top-1 right-1"
					aria-label={intl.t("cancel") as string}
				>
					&#10005;
				</DialogCloseTrigger>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleKickVoter();
					}}
				>
					<DialogDescription as="p" class="mt-6">
						{intl.t("kickVoterDesc", { name: props.voter.name })}
					</DialogDescription>
					<div role="group" class="flex justify-end gap-2 mt-10">
						<button type="submit" class="btn btn-sm">
							{intl.t("confirm")}
						</button>
						<DialogCloseTrigger type="button" class="btn-ghost btn-sm">
							{intl.t("cancel")}
						</DialogCloseTrigger>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default KickVoterButton;
