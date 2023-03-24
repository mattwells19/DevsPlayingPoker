import { Component, For, Match, Show, Switch } from "solid-js";
import { ConfidenceValue, Voter } from "@/shared-types";
import Metric from "./components/Metric";
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
		<div class="rounded-md overflow-hidden shadow-md dark:shadow-none dark:border border-base-content border-opacity-20 ">
			<table class="table w-full bg-slate-50 dark:bg-base-300">
				<thead class="border-b border-base-content border-opacity-20">
					<tr>
						<th colspan="2">{intl.t("voters")}</th>
						<th class="text-center">{intl.t("voted")}</th>
						<th class="text-center">{intl.t("confidence")}</th>
						<Show when={props.onVoterAction}>
							<th
								class="w-0"
								aria-label={intl.t("voterActions") as string}
							></th>
						</Show>
					</tr>
				</thead>
				<tbody>
					<For each={room.roomData.voters}>
						{(voter) => (
							<tr class="[&>td]:bg-slate-50 [&>td]:dark:bg-base-300">
								<td colspan="2">
									<p class="text-ellipsis overflow-hidden max-w-full">
										{voter.name}
									</p>
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
								<Show when={props.onVoterAction}>
									<td>
										<VoterOptionsMenu
											voter={voter}
											onOptionSelect={(action) => {
												props.onVoterAction!(action, voter);
											}}
										/>
									</td>
								</Show>
							</tr>
						)}
					</For>
				</tbody>
				<tfoot class="text-center border-t border-base-content border-opacity-20">
					<tr>
						<Switch>
							<Match when={room.roomData.state === "Voting"}>
								<td colspan="5">{intl.t("votingInProgress")}</td>
							</Match>
							<Match
								when={
									room.roomData.state === "Results" &&
									room.roomData.voters.every(
										(voter) => voter.selection === null,
									)
								}
							>
								<td colspan="5">
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
								<td colspan="5">{intl.t("noVotes")}</td>
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
