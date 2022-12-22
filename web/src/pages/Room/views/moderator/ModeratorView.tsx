import { Component, Match, Switch } from "solid-js";
import type {
	KickVoterEvent,
	ModeratorChangeEvent,
	RoomSchema,
	Voter,
	WebScoketMessageEvent,
} from "@/shared-types";
import Button from "@/components/Button";
import VoterTable from "../../components/VoterTable";
import styles from "./ModeratorView.module.scss";
import type { VoterClickAction } from "../../components/VoterTable";

interface ModeratorViewProps {
	state: RoomSchema["state"];
	voters: RoomSchema["voters"];
	dispatchEvent: (event: WebScoketMessageEvent) => void;
}

const ModeratorView: Component<ModeratorViewProps> = ({
	state,
	voters,
	dispatchEvent,
}) => {
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
			dispatchEvent(event);
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
				onVoterAction={handleVoterAction}
			/>
		</>
	);
};

export default ModeratorView;
