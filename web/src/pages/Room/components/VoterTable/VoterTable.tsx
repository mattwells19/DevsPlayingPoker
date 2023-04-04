import { Component, For, Match, Show, Switch } from "solid-js";
import { ConfidenceValue } from "@/shared-types";
import Metric from "./components/Metric";
import { useRoom } from "../../RoomContext";
import getStats from "./getStats";
import { IntlKey, useIntl } from "@/i18n";
import KickVoterButton from "./components/KickVoterButton";
import TransferModeratorButton from "./components/TransferModeratorButton";

interface VoterTableProps {}

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

const VoterTable: Component<VoterTableProps> = () => {
	const intl = useIntl();
	const room = useRoom();

	const stats = () => getStats(room.roomData.voters);

	return (
		<div class="rounded-md overflow-hidden shadow-md dark:shadow-none dark:border border-base-content border-opacity-20 ">
			<table class="table w-full bg-slate-50 dark:bg-base-300">
				<caption class="bg-slate-50 dark:bg-base-300 p-4">
					<div class="flex justify-between items-center">
						<span class="before:content-['👑'] before:mr-1">
							<Show
								fallback={intl.t("youAreTheModerator")}
								when={!room.userIsModerator}
							>
								{intl.t("xIsTheModerator", {
									moderatorName: room.roomData.moderator?.name,
								})}
							</Show>
						</span>
						<Show when={room.userIsModerator}>
							<TransferModeratorButton />
						</Show>
					</div>
				</caption>
				<thead class="border-b border-base-content border-opacity-20">
					<tr>
						<th colspan="2">{intl.t("voters")}</th>
						<th class="text-center">{intl.t("voted")}</th>
						<th class="text-center">{intl.t("confidence")}</th>
					</tr>
				</thead>
				<tbody>
					<For each={room.roomData.voters}>
						{(voter) => (
							<tr class="[&>td]:bg-slate-50 [&>td]:dark:bg-base-300">
								<td colspan="2">
									<div class="flex items-center justify-between group">
										{voter.name}
										<Show when={room.userIsModerator}>
											<KickVoterButton voter={voter} />
										</Show>
									</div>
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
				<tfoot class="text-center border-t border-base-content border-opacity-20">
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
