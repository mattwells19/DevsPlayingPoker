import type { WebScoketMessageEvent } from "../../types/socket.ts";
import type { EventFunction } from "../types.ts";
import validateModerator from "./validate-moderator.ts";
import validateVoter from "./validate-voter.ts";

const validateInRoom: EventFunction<WebScoketMessageEvent> = (...params) => {
	const isModerator = !validateModerator(...params);
	if (isModerator) return;

	const isVoter = !validateVoter(...params);
	if (isVoter) return;

	return {
		message:
			"This command can only be executed by someone in the specified room which you are not.",
	};
};

export default validateInRoom;
