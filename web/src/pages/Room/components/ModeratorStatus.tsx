import { Component, For, Show } from "solid-js";
import { useIntl } from "@/i18n";
import { useRoom } from "../RoomContext";
import {
	Dialog,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/Dialog";

const ModeratorStatusAsModerator: Component = () => {
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
				class="btn btn-ghost btn-sm normal-case font-normal whitespace-nowrap overflow-hidden text-ellipsis gap-1 ml-auto"
			>
				<span aria-hidden="true" class="mr-1">
					👑
				</span>
				{intl.t("youAreTheModerator")}
			</DialogTrigger>
			<DialogContent>
				<DialogTitle as="h2" class="font-bold text-lg">
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

interface ModeratorStatusProps {
	class?: string;
}

const ModeratorStatus: Component<ModeratorStatusProps> = (props) => {
	const intl = useIntl();
	const room = useRoom();

	return (
		<div class={props.class}>
			<Show
				when={!room.userIsModerator}
				fallback={<ModeratorStatusAsModerator />}
			>
				<p
					class={`whitespace-nowrap overflow-hidden text-ellipsis bg-inherit ${props.class}`}
				>
					<span aria-hidden="true" class="mr-1">
						👑
					</span>
					{intl.t("xIsTheModerator", {
						moderatorName: room.roomData.moderator?.name,
					})}
				</p>
			</Show>
		</div>
	);
};

export default ModeratorStatus;
