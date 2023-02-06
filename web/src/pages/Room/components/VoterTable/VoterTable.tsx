import { Component, For, Match, Switch } from "solid-js";
import { ConfidenceValue, Voter } from "@/shared-types";
import Metric from "../Metric";
import VoterOptionsMenu, {
	VoterClickAction,
} from "./components/VoterOptionsMenu";
import { useRoom } from "../../RoomContext";
import getStats from "./getStats";
import { IntlKey, useIntl } from "@/i18n";

interface VoterTableProps {
	onVoterAction?: (action: VoterClickAction, voter: Voter) => void;
}

export const ConfidenceEmojiMap: Record<ConfidenceValue, string> = {
	[ConfidenceValue.high]: "💪",
	[ConfidenceValue.medium]: "😌",
	[ConfidenceValue.low]: "😰",
};

export const ConfidenceTextMap: Record<ConfidenceValue, IntlKey> = {
	[ConfidenceValue.high]: "highConfidence",
	[ConfidenceValue.medium]: "mediumConfidence",
	[ConfidenceValue.low]: "lowConfidence",
};

function formatSelection(selection: string | null): string {
	if (selection === null || selection === "N/A") {
		return "☕";
	}

	return selection;
}

const VoterTable: Component<VoterTableProps> = (props) => {
	const intl = useIntl();
	const room = useRoom();

	const stats = () => getStats(room.roomData.voters);

	return (
		<div class="border border-base-content border-opacity-50 rounded-lg">
			<table class="table w-full">
				<thead class="border-b border-base-content border-opacity-50">
					<tr>
						<th colspan="2" class="z-0 relative">
							{intl.t("voters")}
						</th>
						<th class="text-center">{intl.t("voted")}</th>
						<th class="text-center">{intl.t("confidence")}</th>
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
											onOptionSelect={props.onVoterAction}
										/>
									) : (
										<p class="text-ellipsis overflow-hidden max-w-full">
											{voter.name}
										</p>
									)}
								</td>
								<td class="text-center">
									{room.roomData.state === "Results"
										? formatSelection(voter.selection)
										: voter.selection !== null
										? "✅"
										: "❌"}
								</td>
								<td
									class="text-center"
									title={
										intl.t(
											voter.confidence !== null
												? ConfidenceTextMap[voter.confidence]
												: "waitingForSelection",
										) as string
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
				<tfoot class="text-center border-t border-base-content border-opacity-50">
					<tr>
						<Switch>
							<Match when={room.roomData.state === "Voting"}>
								<td colspan="4">{intl.t("votingInProgress")}</td>
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
									{intl.t(
										room.roomData.voters.length > 0
											? "waitingToStartVoting"
											: "waitingForVoters",
									)}
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
								<td colspan="4">{intl.t("noVotes")}</td>
							</Match>
							<Match when={room.roomData.state === "Results"}>
								<For each={stats()}>{(stat) => <Metric {...stat} />}</For>
							</Match>
						</Switch>
					</tr>
				</tfoot>
			</table>
		</div>
	);
};

export default VoterTable;
