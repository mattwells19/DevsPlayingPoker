import type {
	EventFunction,
	WebScoketMessageEvent,
} from "../../types/socket.ts";

const validateModerator: EventFunction<WebScoketMessageEvent> = (
	roomData,
	{ userId },
) => {
	if (!roomData.moderator || roomData.moderator.id !== userId) {
		return {
			message:
				"This command can only be executed by a moderator which you are not.",
		};
	}
};

export default validateModerator;
