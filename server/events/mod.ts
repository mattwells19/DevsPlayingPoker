import handleJoin from "./join.ts";
import handleStartVoting from "./start-voting.ts";
import handleStopVoting from "./stop-voting.ts";
import handleOptionSelected from "./option-selected.ts";
import handleModeratorChanged from "./moderator-changed.ts";
import handleVoterKicked from "./voter-kicked.ts";
import handleVotingDescriptionUpdated from "./voting-desc-updated.ts";
import handleNameChanged from "./name-changed.ts";
import {
	validateInRoom,
	validateModerator,
	validateVoter,
} from "./middlewares/mod.ts";
import type { WebScoketMessageEvent } from "../types/socket.ts";
import type { EventFunction } from "./types.ts";

const eventHandlers: {
	[key in WebScoketMessageEvent["event"]]: Array<
		EventFunction<Extract<WebScoketMessageEvent, { event: key }>>
	>;
} = {
	Join: [handleJoin],
	StartVoting: [validateModerator, handleStartVoting],
	StopVoting: [validateModerator, handleStopVoting],
	OptionSelected: [validateVoter, handleOptionSelected],
	ModeratorChange: [validateModerator, handleModeratorChanged],
	KickVoter: [validateModerator, handleVoterKicked],
	UpdateVotingDescription: [validateModerator, handleVotingDescriptionUpdated],
	ChangeName: [validateInRoom, handleNameChanged],
};

export default eventHandlers;
