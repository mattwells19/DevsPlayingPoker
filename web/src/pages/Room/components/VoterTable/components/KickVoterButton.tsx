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
				class="btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 focus:opacity-100 dark:focus:opacity-100 bg-opacity-10 text-secondary bg-secondary hover:bg-opacity-30 hover:bg-secondary dark:text-accent dark:bg-accent dark:bg-opacity-10 dark:hover:bg-opacity-30 dark:hover:bg-accent"
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
					class="btn btn-ghost btn-circle absolute top-1 right-1"
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
					<DialogDescription as="p" class="py-4">
						{intl.t("kickVoterDesc", { name: props.voter.name })}
					</DialogDescription>
					<div role="group" class="modal-action">
						<button type="submit" class="btn btn-primary btn-sm">
							{intl.t("confirm")}
						</button>
						<DialogCloseTrigger type="button" class="btn btn-outline btn-sm">
							{intl.t("cancel")}
						</DialogCloseTrigger>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default KickVoterButton;
