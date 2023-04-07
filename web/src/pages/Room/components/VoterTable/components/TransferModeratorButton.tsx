import {
	Dialog,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/Dialog";
import Icon from "@/components/Icon";
import { useIntl } from "@/i18n";
import { useRoom } from "../../../RoomContext";
import { Component, For } from "solid-js";

interface TransferModeratorButtonProps {}

const TransferModeratorButton: Component<TransferModeratorButtonProps> = () => {
	const intl = useIntl();
	const room = useRoom();

	const handleChangeModerator = (form: EventTarget & HTMLFormElement) => {
		const newModeratorId = new FormData(form).get("new-moderator")?.toString();
		if (!newModeratorId) return;
		room.dispatchEvent({
			event: "ModeratorChange",
			newModeratorId,
		});
	};

	return (
		<Dialog>
			<DialogTrigger
				type="button"
				class="btn btn-ghost btn-sm btn-circle bg-opacity-10 text-secondary bg-secondary hover:bg-opacity-30 hover:bg-secondary dark:text-accent dark:bg-accent dark:bg-opacity-10 dark:hover:bg-opacity-30 dark:hover:bg-accent"
				title={intl.t("transferModerator") as string}
			>
				<Icon
					name="pencil"
					aria-label={intl.t("transferModerator") as string}
					fill="currentColor"
					boxSize="18"
				/>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle as="h2" class="font-bold text-lg text-left">
					<span aria-hidden="true" class="mr-1">
						👑
					</span>
					Change moderator
				</DialogTitle>
				<DialogCloseTrigger
					class="btn btn-ghost btn-circle absolute top-1 right-1"
					aria-label={intl.t("cancel") as string}
					type="button"
				>
					&#10005;
				</DialogCloseTrigger>
				<form
					class="form-control mt-4"
					onSubmit={(e) => {
						e.preventDefault();
						handleChangeModerator(e.currentTarget);
					}}
				>
					<DialogDescription as="label" for="new-moderator" class="label">
						Select a new moderator
					</DialogDescription>
					<select
						id="new-moderator"
						name="new-moderator"
						class="select select-bordered"
					>
						<For each={room.roomData.voters}>
							{(voter) => <option value={voter.id}>{voter.name}</option>}
						</For>
					</select>
					<div role="group" class="modal-action mt-10">
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

export default TransferModeratorButton;
