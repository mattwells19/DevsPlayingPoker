import { Component, createMemo, createUniqueId, For, Show } from "solid-js";
import { useIntl } from "@/i18n";
import { useRoom } from "../RoomContext";
import { useMachine, normalizeProps } from "@zag-js/solid";
import * as dialog from "@zag-js/dialog";
import { Portal } from "solid-js/web";

interface ModeratorStatusProps {
	class?: string;
}

const ModeratorStatusAsModerator: Component<ModeratorStatusProps> = (props) => {
	const intl = useIntl();
	const room = useRoom();

	const [state, send] = useMachine(
		dialog.machine({
			id: createUniqueId(),
			role: "alertdialog",
			// needed to avoid body.style.paddingRight content shift
			preventScroll: false,
		}),
	);

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

	const handleChangeModerator = (form: EventTarget & HTMLFormElement) => {
		const newModeratorId = new FormData(form).get("new-moderator")?.toString();
		if (!newModeratorId) return;
		room.dispatchEvent({
			event: "ModeratorChange",
			newModeratorId,
		});
		api().close();
	};

	return (
		<>
			<button
				class={`btn btn-ghost btn-sm normal-case font-normal whitespace-nowrap overflow-hidden text-ellipsis gap-1 ${props.class}`}
				{...api().triggerProps}
			>
				<span aria-hidden="true" class="mr-1">
					👑
				</span>
				{intl.t("youAreTheModerator")}
			</button>
			<Show when={api().isOpen}>
				<Portal>
					<div {...api().backdropProps} class="fixed inset-0 bg-black/40" />
					<div
						{...api().containerProps}
						class="fixed inset-0 w-full h-full grid place-items-center"
					>
						<div {...api().contentProps} class="modal-box">
							<h2 {...api().titleProps} class="font-bold text-lg">
								<span aria-hidden="true" class="mr-1">
									👑
								</span>
								Change moderator
							</h2>
							<button
								{...api().closeTriggerProps}
								class="btn btn-ghost btn-circle absolute top-1 right-1"
								aria-label={intl.t("cancel") as string}
							>
								&#10005;
							</button>
							<form
								class="form-control mt-4"
								onSubmit={(e) => {
									e.preventDefault();
									handleChangeModerator(e.currentTarget);
								}}
							>
								<label
									{...api().descriptionProps}
									for="new-moderator"
									class="label"
								>
									Select a new moderator
								</label>
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
									<button
										{...api().closeTriggerProps}
										type="button"
										class="btn btn-outline btn-sm"
									>
										{intl.t("cancel")}
									</button>
								</div>
							</form>
						</div>
					</div>
				</Portal>
			</Show>
		</>
	);
};

const ModeratorStatus: Component<ModeratorStatusProps> = (props) => {
	const intl = useIntl();
	const room = useRoom();

	return (
		<>
			<Show
				when={!room.userIsModerator}
				fallback={<ModeratorStatusAsModerator {...props} />}
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
		</>
	);
};

export default ModeratorStatus;
