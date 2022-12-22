import { Component, For, Match, Switch } from "solid-js";
import type { RoomSchema, WebScoketMessageEvent } from "@/shared-types";
import OptionCard from "@/components/OptionCard";
import VoterTable from "../../components/VoterTable";
import styles from "./VoterView.module.scss";

interface VoterViewProps {
	roomDetails: RoomSchema;
	dispatchEvent: (event: WebScoketMessageEvent) => void;
	currentUserId: string;
}

const VoterView: Component<VoterViewProps> = ({
	roomDetails,
	dispatchEvent,
	currentUserId,
}) => {
	// the user object of the current user if they're a voter. null if they're the moderator
	const currentVoter =
		roomDetails.voters.find((voter) => voter.id === currentUserId) ?? null;

	return (
		<Switch>
			<Match when={roomDetails.state === "Results"}>
				<p class={styles.infoText}>
					Waiting for {roomDetails.moderator?.name}...
				</p>
				<VoterTable roomState={roomDetails.state} voters={roomDetails.voters} />
			</Match>
			<Match when={roomDetails.state === "Voting"}>
				<fieldset
					class={styles.voterChoices}
					onchange={(e) => {
						const selectionValue = e.target.hasAttribute("value")
							? (e.target as HTMLInputElement).value
							: null;
						if (!selectionValue) throw new Error("Didn't get a value");
						const selection = parseInt(selectionValue, 10);

						dispatchEvent({
							event: "OptionSelected",
							selection,
						});
					}}
				>
					<legend>
						{currentVoter?.selection !== null
							? "Got it! You can change your mind if you want. Otherwise sit tight."
							: "Make a selection"}
					</legend>
					<For each={roomDetails.options}>
						{(option) => (
							<OptionCard
								selected={option === currentVoter?.selection}
								value={option}
							/>
						)}
					</For>
				</fieldset>
			</Match>
		</Switch>
	);
};

export default VoterView;
