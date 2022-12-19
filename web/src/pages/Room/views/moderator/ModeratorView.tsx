import { Component, Match, Switch } from "solid-js";
import type { RoomSchema, Voter, WebSocketEvent } from "@/shared-types";
import Button from "@/components/Button";
import VoterTable from "../../components/VoterTable";
import styles from "./ModeratorView.module.scss";

interface ModeratorViewProps {
	state: RoomSchema["state"];
	voters: RoomSchema["voters"];
	dispatchEvent: (event: WebSocketEvent) => void;
}

const ModeratorView: Component<ModeratorViewProps> = ({
	state,
	voters,
	dispatchEvent,
}) => {
	function handleVoterClick(voter: Voter) {
		const confirmed = confirm(
			`Are you sure you want to make ${voter.name} the new moderator?`,
		);
		if (confirmed) {
			dispatchEvent({
				event: "ModeratorChange",
				newModeratorId: voter.id,
			});
		}
	}

	return (
		<>
			<Switch>
				<Match when={state === "Results"}>
					<Button
						class={styles.moderatorBtn}
						onClick={() => dispatchEvent({ event: "StartVoting" })}
						disabled={voters.length === 0}
					>
						{voters.some((voter) => voter.selection !== null)
							? "Reset Votes & Start Voting"
							: "Start Voting"}
					</Button>
				</Match>
				<Match when={state === "Voting"}>
					<Button
						class={styles.moderatorBtn}
						onClick={() => dispatchEvent({ event: "StopVoting" })}
					>
						Stop Voting
					</Button>
				</Match>
			</Switch>
			<VoterTable
				roomState={state}
				voters={voters}
				onVoterClick={handleVoterClick}
			/>
		</>
	);
};

export default ModeratorView;
