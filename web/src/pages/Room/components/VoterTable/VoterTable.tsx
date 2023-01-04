import { Component, createSignal, For, Match, Show, Switch } from "solid-js";
import { ConfidenceValue, Voter } from "@/shared-types";
import Metric from "../Metric";
import styles from "./VoterTable.module.scss";
import VoterOptionsMenu, {
	VoterClickAction,
} from "./components/VoterOptionsMenu";
import OptionConfirmationDialog from "./components/OptionConfirmationDialog";
import { useRoom } from "../../RoomContext";
import getStats from "./getStats";

interface VoterTableProps {
	onVoterAction?: (action: VoterClickAction, voter: Voter) => void;
}

export const ConfidenceEmojiMap: Record<ConfidenceValue, string> = {
	[ConfidenceValue.high]: "💪",
	[ConfidenceValue.medium]: "😌",
	[ConfidenceValue.low]: "😰",
};

export const ConfidenceTextMap: Record<ConfidenceValue, string> = {
	[ConfidenceValue.high]: "High confidence",
	[ConfidenceValue.medium]: "Medium confidence",
	[ConfidenceValue.low]: "Low confidence",
};

function formatSelection(selection: string | null): string {
	if (selection === null || selection === "N/A") {
		return "☕";
	}

	return selection;
}

const VoterTable: Component<VoterTableProps> = (props) => {
	const [optionConfirmation, setOptionConfirmation] = createSignal<{
		action: VoterClickAction;
		voter: Voter;
	} | null>(null);
	const room = useRoom();

	const stats = () => getStats(room.roomData.voters);

	return (
		<>
			<div class={styles.tableContainer}>
				<table class={styles.voterTable}>
					<thead>
						<tr>
							<th colspan="2">Voters</th>
							<th>Voted</th>
							<th>Confidence</th>
						</tr>
					</thead>
					<tbody>
						<For each={room.roomData.voters}>
							{(voter) => (
								<tr>
									<td colspan="2">
										{props.onVoterAction ? (
											<VoterOptionsMenu
												voter={voter}
												onVoterClick={(action, voter) =>
													setOptionConfirmation({ action, voter })
												}
											/>
										) : (
											<p class={styles.voterName}>{voter.name}</p>
										)}
									</td>
									<td>
										{room.roomData.state === "Results"
											? formatSelection(voter.selection)
											: voter.selection !== null
											? "✅"
											: "❌"}
									</td>
									<td
										title={
											voter.confidence !== null
												? ConfidenceTextMap[voter.confidence]
												: "Waiting for selection."
										}
									>
										{voter.confidence !== null
											? ConfidenceEmojiMap[voter.confidence]
											: "❓"}
									</td>
								</tr>
							)}
						</For>
					</tbody>
					<tfoot>
						<tr>
							<Switch>
								<Match when={room.roomData.state === "Voting"}>
									<td colspan="4">Voting in progress</td>
								</Match>
								<Match
									when={
										room.roomData.state === "Results" &&
										room.roomData.voters.every(
											(voter) => voter.selection === null,
										)
									}
								>
									<td colspan="4">
										{room.roomData.voters.length > 0
											? "Waiting to start voting"
											: "Waiting for people to join"}
									</td>
								</Match>
								<Match
									when={
										room.roomData.state === "Results" &&
										room.roomData.voters.every(
											(voter) => voter.selection === "N/A",
										)
									}
								>
									<td colspan="4">No votes were cast.</td>
								</Match>
								<Match when={room.roomData.state === "Results"}>
									<For each={stats()}>{(stat) => <Metric {...stat} />}</For>
								</Match>
							</Switch>
						</tr>
					</tfoot>
				</table>
			</div>
			{props.onVoterAction ? (
				<Show when={optionConfirmation()} keyed>
					{({ action, voter }) => (
						<OptionConfirmationDialog
							action={action}
							voter={voter}
							onConfirm={() => props.onVoterAction!(action, voter)}
							onCancel={() => setOptionConfirmation(null)}
						/>
					)}
				</Show>
			) : null}
		</>
	);
};

export default VoterTable;
