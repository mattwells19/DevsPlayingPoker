import type {
	EventFunction,
	WebScoketMessageEvent,
} from "../../types/socket.ts";

const validateVoter: EventFunction<WebScoketMessageEvent> = (
	roomData,
	{ userId },
) => {
	if (roomData.voters.every((voter) => voter.id !== userId)) {
		return {
			message:
				"This command can only be executed by a voter in the specified room which you are not.",
		};
	}
};

export default validateVoter;
