import { Component, Match, Switch } from "solid-js";
import type {
	KickVoterEvent,
	ModeratorChangeEvent,
	Voter,
} from "@/shared-types";
import VoterTable from "../components/VoterTable";
import type { VoterClickAction } from "../components/VoterTable";
import { useRoom } from "../RoomContext";
import { useIntl } from "@/i18n";

interface ModeratorViewProps {}

const ModeratorView: Component<ModeratorViewProps> = () => {
	const intl = useIntl();
	const room = useRoom();

	function handleVoterAction(action: VoterClickAction, voter: Voter) {
		const event = (() => {
			switch (action) {
				case "kickVoter":
					return {
						event: "KickVoter",
						voterId: voter.id,
					} as KickVoterEvent;
				case "makeModerator":
					return {
						event: "ModeratorChange",
						newModeratorId: voter.id,
					} as ModeratorChangeEvent;
			}
		})();

		if (event) {
			room.dispatchEvent(event);
		}
	}

	return (
		<>
			<Switch>
				<Match when={room.roomData.state === "Results"}>
					<button
						class="btn btn-primary w-full mb-4"
						onClick={() => room.dispatchEvent({ event: "StartVoting" })}
						disabled={room.roomData.voters.length === 0}
					>
						{intl.t(
							room.roomData.voters.some((voter) => voter.selection !== null)
								? "resetAndStartVoting"
								: "startVoting",
						)}
					</button>
				</Match>
				<Match when={room.roomData.state === "Voting"}>
					<button
						class="btn btn-primary w-full mb-4"
						onClick={() => room.dispatchEvent({ event: "StopVoting" })}
					>
						{intl.t("stopVoting")}
					</button>
				</Match>
			</Switch>
			<VoterTable onVoterAction={handleVoterAction} />
		</>
	);
};

export default ModeratorView;
