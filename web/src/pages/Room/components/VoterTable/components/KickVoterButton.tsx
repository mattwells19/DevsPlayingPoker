import { useIntl } from "@/i18n";
import { Component, createMemo, createUniqueId, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useMachine, normalizeProps } from "@zag-js/solid";
import * as dialog from "@zag-js/dialog";
import { useRoom } from "@/pages/Room/RoomContext";
import type { Voter } from "@/shared-types";

interface KickVoterButtonProps {
	voter: Voter;
}

const KickVoterButton: Component<KickVoterButtonProps> = (props) => {
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

	const handleKickVoter = () => {
		room.dispatchEvent({
			event: "KickVoter",
			voterId: props.voter.id,
		});
		api().close();
	};

	return (
		<>
			<button
				{...api().triggerProps}
				class="btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 focus:opacity-100 text-secondary dark:text-accent"
				aria-label={`Kick ${props.voter.name}`}
			>
				&#10005;
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
									🥾
								</span>
								{intl.t("kickVoter")}
							</h2>
							<button
								{...api().closeTriggerProps}
								class="btn btn-ghost btn-circle absolute top-1 right-1"
								aria-label={intl.t("cancel") as string}
							>
								&#10005;
							</button>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleKickVoter();
								}}
							>
								<p class="py-4">
									{intl.t("kickVoterDesc", { name: props.voter.name })}
								</p>
								<div role="group" class="modal-action">
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

export default KickVoterButton;
