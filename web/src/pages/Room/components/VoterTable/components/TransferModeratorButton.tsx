import Icon from "@/components/Icon";
import { useIntl } from "@/i18n";
import { useRoom } from "../../../RoomContext";
import { Component, For, Show } from "solid-js";
import type { Voter } from "@/shared-types";
import useModal from "@/components/useModal";

interface TransferModeratorButtonProps {
	options: Array<Voter>;
	discreet?: boolean;
}

const TransferModeratorButton: Component<TransferModeratorButtonProps> = (
	props,
) => {
	const intl = useIntl();
	const room = useRoom();
	const modal = useModal();

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
			<button
				type="button"
				class="p-2 rounded-full transition-all bg-opacity-10 text-brand-reddish bg-brand-reddish hover:(bg-opacity-30 bg-brand-reddish) dark:(text-brand-turquoise bg-brand-turquoise bg-opacity-10 hover:bg-opacity-30) group-hover:opacity-100 focus:opacity-100"
				classList={{ "opacity-0": props.discreet }}
				title={intl.t("transferModerator") as string}
				{...modal.openModalProps}
			>
				<Icon
					name="arrows-right-left"
					aria-label={intl.t("transferModerator") as string}
					fill="currentColor"
					boxSize="16"
				/>
			</button>
			<dialog
				aria-labelledby="transfer-moderator-title"
				aria-describedby="new-moderator-label"
				class="modal"
				{...modal.modalDialogProps}
			>
				<h2 id="transfer-moderator-title" class="font-bold text-lg text-left">
					<span aria-hidden="true" class="mr-1">
						👑
					</span>
					{intl.t("transferModerator")}
				</h2>
				<button
					type="button"
					class="btn-ghost rounded-full absolute top-1 right-1"
					aria-label={intl.t("cancel") as string}
					{...modal.closeModalProps}
				>
					&#10005;
				</button>
				<form
					class="form-control mt-6"
					onSubmit={(e) => {
						e.preventDefault();
						handleChangeModerator(e.currentTarget);
					}}
				>
					<label id="new-moderator-label" for="new-moderator" class="text-left">
						{intl.t("selectNewModerator")}
					</label>
					<select id="new-moderator" name="new-moderator">
						<For each={props.options}>
							{(voter) => <option value={voter.id}>{voter.name}</option>}
						</For>
					</select>
					<div role="group" class="flex justify-end gap-2 mt-10">
						<button type="submit" class="btn btn-sm">
							{intl.t("confirm")}
						</button>
						<button
							type="button"
							class="btn-ghost btn-sm"
							{...modal.closeModalProps}
						>
							{intl.t("cancel")}
						</button>
					</div>
				</form>
			</dialog>
		</Show>
	);
};

export default TransferModeratorButton;
