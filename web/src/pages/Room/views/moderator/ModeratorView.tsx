import { Component, Match, Switch } from "solid-js";
import type {
	KickVoterEvent,
	ModeratorChangeEvent,
	Voter,
} from "@/shared-types";
import Button from "@/components/Button";
import VoterTable from "../../components/VoterTable";
import styles from "./ModeratorView.module.scss";
import type { VoterClickAction } from "../../components/VoterTable";
import { useRoom } from "../../RoomContext";
import { useFormatMessage } from "@/i18n";

interface ModeratorViewProps {}

const ModeratorView: Component<ModeratorViewProps> = () => {
	const t = useFormatMessage();
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
					<Button
						class={styles.moderatorBtn}
						onClick={() => room.dispatchEvent({ event: "StartVoting" })}
						disabled={room.roomData.voters.length === 0}
					>
						{t(
							room.roomData.voters.some((voter) => voter.selection !== null)
								? "resetAndStartVoting"
								: "startVoting",
						)}
					</Button>
				</Match>
				<Match when={room.roomData.state === "Voting"}>
					<Button
						class={styles.moderatorBtn}
						onClick={() => room.dispatchEvent({ event: "StopVoting" })}
					>
						{t("stopVoting")}
					</Button>
				</Match>
			</Switch>
			<VoterTable onVoterAction={handleVoterAction} />
		</>
	);
};

export default ModeratorView;
