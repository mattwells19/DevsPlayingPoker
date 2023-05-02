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
	discreet?: boolean;
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
					class="p-2 rounded-full transition-all bg-opacity-10 text-brand-reddish bg-brand-reddish hover:(bg-opacity-30 bg-brand-reddish) dark:(text-brand-turquoise bg-brand-turquoise bg-opacity-10 hover:bg-opacity-30) group-hover:opacity-100 focus:opacity-100"
					classList={{ "opacity-0": props.discreet }}
					title={intl.t("transferModerator") as string}
				>
					<Icon
						name="arrows-right-left"
						aria-label={intl.t("transferModerator") as string}
						fill="currentColor"
						boxSize="16"
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
						class="btn-ghost rounded-full absolute top-1 right-1"
						aria-label={intl.t("cancel") as string}
						type="button"
					>
						&#10005;
					</DialogCloseTrigger>
					<form
						class="form-control mt-6"
						onSubmit={(e) => {
							e.preventDefault();
							handleChangeModerator(e.currentTarget);
						}}
					>
						<DialogDescription as="label" for="new-moderator">
							{intl.t("selectNewModerator")}
						</DialogDescription>
						<select id="new-moderator" name="new-moderator">
							<For each={props.options}>
								{(voter) => <option value={voter.id}>{voter.name}</option>}
							</For>
						</select>
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
		</Show>
	);
};

export default TransferModeratorButton;
