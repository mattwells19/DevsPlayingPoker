import { Component, For, Match, Switch } from "solid-js";
import { RoomSchema, ConfidenceValue, Voter } from "@/shared-types";
import Metric from "../Metric";
import styles from "./VoterTable.module.scss";

interface VoterTableProps {
	voters: RoomSchema["voters"];
	roomState: RoomSchema["state"];
	onVoterClick?: (voter: Voter) => void;
}

const ConfidenceEmojiMap: Record<ConfidenceValue, string> = {
	[ConfidenceValue.high]: "💪",
	[ConfidenceValue.medium]: "😌",
	[ConfidenceValue.low]: "😰",
};

const ConfidenceTextMap: Record<ConfidenceValue, string> = {
	[ConfidenceValue.high]: "High confidence",
	[ConfidenceValue.medium]: "Medium confidence",
	[ConfidenceValue.low]: "Low confidence",
};

function formatSelection(selection: number | null): string | number {
	if (selection === null || selection === 0) {
		return "☕";
	}

	return selection;
}

const VoterTable: Component<VoterTableProps> = ({
	roomState,
	voters,
	onVoterClick,
}) => {
	let high = -1,
		low = Infinity,
		mode = -1,
		voterCount = 0,
		avgConfidence: ConfidenceValue = 0;
	const modeCounter = new Map<number, number>();

	voters.forEach(({ selection, confidence }) => {
		if (selection === null || selection === 0) return;
		voterCount++;

		const currCount = modeCounter.get(selection) ?? 0;
		const newCount = currCount + 1;

		const currModeCount = modeCounter.get(mode) ?? -1;
		if (
			newCount > currModeCount ||
			(newCount === currModeCount && selection > mode)
		) {
			mode = selection;
		}

		modeCounter.set(selection, newCount);

		if (selection > high) {
			high = selection;
		}
		if (selection < low) {
			low = selection;
		}

		avgConfidence += confidence;
	});
	avgConfidence = Math.round(avgConfidence / voterCount);

	return (
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
					<For each={voters}>
						{(voter) => (
							<tr>
								<td colspan="2">
									{onVoterClick ? (
										<button
											class={styles.voterName}
											onClick={() => onVoterClick(voter)}
										>
											{voter.name}
										</button>
									) : (
										<p class={styles.voterName}>{voter.name}</p>
									)}
								</td>
								<td>
									{roomState === "Results"
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
							<Match when={roomState === "Voting"}>
								<td colspan="4">Voting in progress</td>
							</Match>
							<Match
								when={
									roomState === "Results" &&
									voters.every((voter) => voter.selection === null)
								}
							>
								<td colspan="4">
									{voters.length > 0
										? "Waiting to start voting"
										: "Waiting for people to join"}
								</td>
							</Match>
							<Match
								when={
									roomState === "Results" &&
									voters.every((voter) => voter.selection === 0)
								}
							>
								<td colspan="4">No votes were cast.</td>
							</Match>
							<Match when={roomState === "Results"}>
								<Metric label="Low" value={low} />
								<Metric label="High" value={high} />
								<Metric label="Mode" value={mode} />
								<Metric
									label="Confidence"
									value={ConfidenceEmojiMap[avgConfidence]}
									title={ConfidenceTextMap[avgConfidence]}
								/>
							</Match>
						</Switch>
					</tr>
				</tfoot>
			</table>
		</div>
	);
};

export default VoterTable;
