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
import { Component, For, Show } from "solid-js";
import type { Voter } from "@/shared-types";

interface TransferModeratorButtonProps {
	options: Array<Voter>;
}

const TransferModeratorButton: Component<TransferModeratorButtonProps> = (
	props,
) => {
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
		<Show when={props.options.length > 0}>
			<Dialog>
				<DialogTrigger
					type="button"
					class="btn btn-ghost btn-sm btn-circle bg-opacity-10 text-secondary bg-secondary hover:bg-opacity-30 hover:bg-secondary dark:text-accent dark:bg-accent dark:bg-opacity-10 dark:hover:bg-opacity-30 dark:hover:bg-accent group-hover:opacity-100 group-only:opacity-0"
					title={intl.t("transferModerator") as string}
				>
					<Icon
						name="arrows-right-left"
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
						{intl.t("transferModerator")}
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
							{intl.t("selectNewModerator")}
						</DialogDescription>
						<select
							id="new-moderator"
							name="new-moderator"
							class="select select-bordered"
						>
							<For each={props.options}>
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
		</Show>
	);
};

export default TransferModeratorButton;
