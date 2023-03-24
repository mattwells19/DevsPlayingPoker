import { Component, Show } from "solid-js";
import { useIntl } from "@/i18n";
import { useRoom } from "../RoomContext";

interface ModeratorStatusProps {
	class?: string;
}

const ModeratorStatus: Component<ModeratorStatusProps> = (props) => {
	const intl = useIntl();
	const room = useRoom();

	return (
		<p
			class={`whitespace-nowrap overflow-hidden text-ellipsis bg-inherit ${props.class}`}
		>
			<span aria-hidden="true" class="mr-1">
				👑
			</span>
			<Show
				fallback={intl.t("youAreTheModerator")}
				when={room.currentUserId !== room.roomData.moderator?.id}
			>
				{intl.t("xIsTheModerator", {
					moderatorName: room.roomData.moderator?.name,
				})}
			</Show>
		</p>
	);
};

export default ModeratorStatus;
