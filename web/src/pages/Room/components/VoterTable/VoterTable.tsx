import {
	Component,
	createMemo,
	createSignal,
	For,
	Match,
	Show,
	Switch,
} from "solid-js";
import { ConfidenceValue, Voter } from "@/shared-types";
import Metric from "../Metric";
import styles from "./VoterTable.module.scss";
import VoterOptionsMenu, {
	VoterClickAction,
} from "./components/VoterOptionsMenu";
import OptionConfirmationDialog from "./components/OptionConfirmationDialog";
import { useRoom } from "../../RoomContext";

interface VoterTableProps {
	onVoterAction?: (action: VoterClickAction, voter: Voter) => void;
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

const VoterTable: Component<VoterTableProps> = (props) => {
	const [optionConfirmation, setOptionConfirmation] = createSignal<{
		action: VoterClickAction;
		voter: Voter;
	} | null>(null);
	const room = useRoom();

	const stats = createMemo(() => {
		let high = -1,
			low = Infinity,
			mode = -1,
			voterCount = 0,
			avgConfidence: ConfidenceValue = 0;
		const modeCounter = new Map<number, number>();

		room.roomData.voters.forEach(({ selection, confidence }) => {
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

		return {
			high,
			low,
			mode,
			voterCount,
			avgConfidence,
		};
	});

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
										room.roomData.voters.every((voter) => voter.selection === 0)
									}
								>
									<td colspan="4">No votes were cast.</td>
								</Match>
								<Match when={room.roomData.state === "Results"}>
									<Metric label="Low" value={stats().low} />
									<Metric label="High" value={stats().high} />
									<Metric label="Mode" value={stats().mode} />
									<Metric
										label="Confidence"
										value={ConfidenceEmojiMap[stats().avgConfidence]}
										title={ConfidenceTextMap[stats().avgConfidence]}
									/>
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
