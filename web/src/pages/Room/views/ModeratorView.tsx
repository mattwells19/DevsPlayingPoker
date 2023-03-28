import { Component, Match, Switch } from "solid-js";
import VoterTable from "../components/VoterTable";
import { useRoom } from "../RoomContext";
import { useIntl } from "@/i18n";

interface ModeratorViewProps {}

const ModeratorView: Component<ModeratorViewProps> = () => {
	const intl = useIntl();
	const room = useRoom();

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
			<VoterTable />
		</>
	);
};

export default ModeratorView;
